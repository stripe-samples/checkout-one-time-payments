package com.stripe.sample;

import java.nio.file.Paths;

import java.util.HashMap;
import java.util.Map;

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

    static class PostBody {
        @SerializedName("quantity")
        Long quantity;

        public Long getQuantity() {
            return quantity;
        }
    }

    public static void main(String[] args) {
        port(4242);

        Dotenv dotenv = Dotenv.load();

        Stripe.apiKey = dotenv.get("STRIPE_SECRET_KEY");

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
            response.type("application/json");
            PostBody postBody = gson.fromJson(request.body(), PostBody.class);

            String domainUrl = dotenv.get("DOMAIN");
            Long quantity = postBody.getQuantity();
            String price = dotenv.get("PRICE");

            // Create new Checkout Session for the order
            // Other optional params include:
            // [billing_address_collection] - to display billing address details on the page
            // [customer] - if you have an existing Stripe Customer ID
            // [customer_email] - lets you prefill the email input in the form
            // For full details see https://stripe.com/docs/api/checkout/sessions/create

            // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID
            // set as a query param
            SessionCreateParams.Builder builder = new SessionCreateParams.Builder()
                    .setSuccessUrl(domainUrl + "/success.html?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(domainUrl + "/canceled.html").addPaymentMethodType(PaymentMethodType.CARD)
                    .setMode(SessionCreateParams.Mode.PAYMENT);

            // Add a line item for the sticker the Customer is purchasing
            LineItem item = new LineItem.Builder().setQuantity(quantity).setPrice(price).build();
            builder.addLineItem(item);

            SessionCreateParams createParams = builder.build();
            Session session = Session.create(createParams);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("sessionId", session.getId());
            return gson.toJson(responseData);
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
}