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
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.exception.*;
import com.stripe.net.Webhook;
import com.stripe.net.ApiResource;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.checkout.SessionCreateParams.LineItem;
import com.stripe.param.checkout.SessionCreateParams.PaymentMethodType;

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
        Stripe.apiKey = System.getenv("STRIPE_SECRET_KEY");
        staticFiles.externalLocation(Paths.get(Paths.get("").toAbsolutePath().toString(), System.getenv("STATIC_DIR"))
                .normalize().toString());

        get("/public-key", (request, response) -> {
            response.type("application/json");

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("publicKey", System.getenv("STRIPE_PUBLIC_KEY"));
            return gson.toJson(responseData);
        });

        get("/checkout-session", (request, response) -> {
            response.type("application/json");

            String sessionId = request.queryParams("sessionId");
            Session session = Session.retrieve(sessionId);

            return gson.toJson(session);
        });

        post("/create-checkout-session", (request, response) -> {
            response.type("application/json");
            PostBody postBody = gson.fromJson(request.body(), PostBody.class);

            String domainUrl = System.getenv("DOMAIN");
            SessionCreateParams.Builder builder = new SessionCreateParams.Builder();

            builder.setSuccessUrl(domainUrl + "/success.html?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(domainUrl + "/canceled.html").addPaymentMethodType(PaymentMethodType.CARD);

            // Add a line item for the sticker the Customer is purchasing
            LineItem item = new LineItem.Builder().setName("Pasha photo").setAmount(new Long(500))
                    .setQuantity(postBody.getQuantity()).setCurrency("usd").build();
            builder.addLineItem(item);

            SessionCreateParams createParams = builder.build();
            Session session = Session.create(createParams);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("sessionId", session.getId());
            return gson.toJson(responseData);
        });

        post("/webhook", (request, response) -> {
            System.out.println("Webhook");
            String payload = request.body();
            String sigHeader = request.headers("Stripe-Signature");
            String endpointSecret = System.getenv("STRIPE_WEBHOOK_SECRET");

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