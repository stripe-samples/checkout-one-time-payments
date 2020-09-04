package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/joho/godotenv"
	"github.com/stripe/stripe-go"
	"github.com/stripe/stripe-go/checkout/session"
	"github.com/stripe/stripe-go/webhook"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/config", serveConfig)
	r.Get("/checkout-session", checkoutSession)
	r.Post("/create-checkout-session", createCheckOutSession)
	r.Post("/webhook", webhookHandler)
	// FileServer(r)
	filesDir := http.Dir(os.Getenv("STATIC_DIR"))
	FileServer(r, "/", filesDir)
	http.ListenAndServe(":4242", r)
}

type postBody struct {
	Quantity int64 `json:"quantity"`
}

func createCheckOutSession(w http.ResponseWriter, r *http.Request) {

	req := postBody{}
	json.NewDecoder(r.Body).Decode(&req)
	domainURL := os.Getenv("DOMAIN")
	// basePrice :=
	currency := os.Getenv("CURRENCY")
	basePrice, _ := strconv.ParseInt(os.Getenv("BASE_PRICE"), 10, 64)

	// Create new Checkout Session for the order
	// Other optional params include:
	// [billing_address_collection] - to display billing address details on the page
	// [customer] - if you have an existing Stripe Customer ID
	// [payment_intent_data] - lets capture the payment later
	// [customer_email] - lets you prefill the email input in the form
	// For full details see https://stripe.com/docs/api/checkout/sessions/create

	// ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID
	// set as a query param
	name := "Pasha photo"
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{
			"card",
		}),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Amount:   &basePrice,
				Currency: &currency,
				Name:     &name,
				Quantity: &req.Quantity,
			},
		},
		SuccessURL: stripe.String(domainURL + "/success.html?session_id={CHECKOUT_SESSION_ID}"),
		CancelURL:  stripe.String(domainURL + "/canceled.html"),
	}
	checkoutSession, err := session.New(params)
	if err != nil {
		http.Error(w, fmt.Sprintf("error while creating session %v", err.Error()), http.StatusInternalServerError)
		return
	}
	type reponse struct {
		SessionID string `json:"sessionId"`
	}
	respond(w, http.StatusOK, reponse{
		SessionID: checkoutSession.ID,
	}, nil)
}

func webhookHandler(w http.ResponseWriter, r *http.Request) {
	const MaxBodyBytes = int64(65536)
	r.Body = http.MaxBytesReader(w, r.Body, MaxBodyBytes)
	payload, err := ioutil.ReadAll(r.Body)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading request body: %v\n", err)
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}

	// If you are testing your webhook locally with the Stripe CLI you
	// can find the endpoint's secret by running `stripe listen`
	// Otherwise, find your endpoint's secret in your webhook settings in the Developer Dashboard
	endpointSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")

	// Pass the request body and Stripe-Signature header to ConstructEvent, along
	// with the webhook signing key.
	event, err := webhook.ConstructEvent(payload, r.Header.Get("Stripe-Signature"),
		endpointSecret)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Error verifying webhook signature: %v\n", err)
		w.WriteHeader(http.StatusBadRequest) // Return a 400 error on a bad signature
		return
	}

	// Unmarshal the event data into an appropriate struct depending on its Type
	switch event.Type {
	case "checkout.session.completed":
		var session stripe.CheckoutSession
		err := json.Unmarshal(event.Data.Raw, &session)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error parsing webhook JSON: %v\\n", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		fmt.Fprintln(os.Stdout, "Payment succeeded!")
	default:
		fmt.Fprintf(os.Stderr, "Unexpected event type: %s\\n", event.Type)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusOK)
}

type config struct {
	PublicKey string `json:"publicKey"`
	BasePrice string `json:"basePrice"`
	Currency  string `json:"currency"`
}

func serveConfig(w http.ResponseWriter, r *http.Request) {
	respond(w, http.StatusOK, config{
		PublicKey: os.Getenv("STRIPE_PUBLISHABLE_KEY"),
		BasePrice: os.Getenv("BASE_PRICE"),
		Currency:  os.Getenv("CURRENCY"),
	}, nil)
}

// Fetch the Checkout Session to display the JSON result on the success page
func checkoutSession(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("sessionId")
	session, err := session.Get(sessionID, &stripe.CheckoutSessionParams{})
	if err != nil {
		http.Error(w, fmt.Sprintf("error while retrieving session %v", err.Error()), http.StatusInternalServerError)
		return
	}
	respond(w, http.StatusOK, session, nil)
}

// respond converts a Go value to JSON and sends it to the client.
func respond(w http.ResponseWriter, httpStatusCode int, object interface{}, headers map[string]string) {
	bytes, err := json.Marshal(object)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if headers != nil {
		for key, value := range headers {
			w.Header().Set(key, value)
		}
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(httpStatusCode)
	w.Write(bytes)
}

// FileServer is serving static file
func FileServer(r chi.Router, path string, root http.FileSystem) {
	if strings.ContainsAny(path, "{}*") {
		panic("FileServer does not permit any URL parameters.")
	}

	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", 301).ServeHTTP)
		path += "/"
	}
	path += "*"

	r.Get(path, func(w http.ResponseWriter, r *http.Request) {
		rctx := chi.RouteContext(r.Context())
		pathPrefix := strings.TrimSuffix(rctx.RoutePattern(), "/*")
		fs := http.StripPrefix(pathPrefix, http.FileServer(root))
		fs.ServeHTTP(w, r)
	})
}
