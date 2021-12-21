package com.stripe.sample;

import java.nio.file.Paths;
import java.nio.charset.Charset;

import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Arrays;
import java.util.stream.Stream;
import java.util.stream.Collectors;

import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.port;
import static spark.Spark.staticFiles;

import com.google.gson.Gson;
import com.google.gson.annotations.SerializedName;

import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.model.Price;
import com.stripe.exception.*;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.checkout.SessionCreateParams.LineItem;
import com.stripe.param.checkout.SessionCreateParams.PaymentMethodType;

import io.github.cdimascio.dotenv.Dotenv;

public class Server {
    private static Gson gson = new Gson();

    public static void main(String[] args) {
        port(4242);

        Dotenv dotenv = Dotenv.load();

        checkEnv();

        Stripe.apiKey = dotenv.get("STRIPE_SECRET_KEY");
        Stripe.setAppInfo(
            "stripe-samples/checkout-one-time-payments",
            "0.0.1",
            "https://github.com/stripe-samples/checkout-one-time-payments"
        );


        staticFiles.externalLocation(
                Paths.get(Paths.get("").toAbsolutePath().toString(), dotenv.get("STATIC_DIR")).normalize().toString());

        get("/config", (request, response) -> {
            response.type("application/json");
            Price price = Price.retrieve(dotenv.get("PRICE"));

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("publicKey", dotenv.get("STRIPE_PUBLISHABLE_KEY"));
            responseData.put("unitAmount", price.getUnitAmount());
            responseData.put("currency", price.getCurrency());
            return gson.toJson(responseData);
        });

        // Fetch the Checkout Session to display the JSON result on the success page
        get("/checkout-session", (request, response) -> {
            response.type("application/json");

            String sessionId = request.queryParams("sessionId");
            Session session = Session.retrieve(sessionId);

            return gson.toJson(session);
        });

        post("/create-checkout-session", (request, response) -> {
            String domainUrl = dotenv.get("DOMAIN");
            Long quantity = Long.parseLong(request.queryParams("quantity"));
            String price = dotenv.get("PRICE");

            // Create new Checkout Session for the order
            // Other optional params include:
            // [billing_address_collection] - to display billing address details on the page
            // [customer] - if you have an existing Stripe Customer ID
            // [customer_email] - lets you prefill the email input in the form
            // [automatic_tax] - to automatically calculate sales tax, VAT and GST in the checkout page
            // For full details see https://stripe.com/docs/api/checkout/sessions/create

            // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID
            // set as a query param
            SessionCreateParams.Builder builder = new SessionCreateParams.Builder()
                    .setSuccessUrl(domainUrl + "/success.html?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(domainUrl + "/canceled.html")
                    // .setAutomaticTax(SessionCreateParams.AutomaticTax.builder().setEnabled(true).build())
                    .setMode(SessionCreateParams.Mode.PAYMENT);

            // Add a line item for the sticker the Customer is purchasing
            LineItem item = new LineItem.Builder().setQuantity(quantity).setPrice(price).build();
            builder.addLineItem(item);

            SessionCreateParams createParams = builder.build();
            Session session = Session.create(createParams);

            response.redirect(session.getUrl(), 303);
            return "";
        });

        post("/webhook", (request, response) -> {
            String payload = request.body();
            String sigHeader = request.headers("Stripe-Signature");
            String endpointSecret = dotenv.get("STRIPE_WEBHOOK_SECRET");

            Event event = null;

            try {
                event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            } catch (SignatureVerificationException e) {
                // Invalid signature
                response.status(400);
                return "";
            }

            switch (event.getType()) {
                case "checkout.session.completed":
                    System.out.println("Payment succeeded!");
                    response.status(200);
                    return "";
                default:
                    response.status(200);
                    return "";
            }
        });
    }

    public static void checkEnv() {
        Dotenv dotenv = Dotenv.load();
        String price = dotenv.get("PRICE");
        if(price == "price_12345" || price == "" || price == null) {
          System.out.println("You must set a Price ID in the .env file. Please see the README.");
          System.exit(0);
        }
    }
}
