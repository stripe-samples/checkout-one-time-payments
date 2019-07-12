package com.stripe.recipe;

import java.util.HashMap;
import java.util.Map;

import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.port;

import com.google.gson.Gson;
import com.google.gson.annotations.SerializedName;

import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.exception.*;
import com.stripe.net.Webhook;

public class Server {
    private static Gson gson = new Gson();

    static class PostBody {
        @SerializedName("some_field")
        String someField;

        public String getSomeField() {
            return someField;
        }
    }

    public static void main(String[] args) {
        port(4242);
        Stripe.apiKey = System.getenv("STRIPE_SECRET_KEY");

        get("/", (request, response) -> {
            response.type("application/json");

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("some_key", "some_value");
            return gson.toJson(responseData);
        });

        post("/post", (request, response) -> {
            PostBody postBody = gson.fromJson(request.body(), PostBody.class);

            response.type("application/json");
            System.out.println(postBody.getSomeField());
            if (postBody.getSomeField().equals("something")) {
                return "{\"data\": \"something \"}";
            } else {
                return "{\"data\": \"nothing \"}";
            }
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
            case "payment_intent.succeeded":
                System.out.println("Received event");
                break;
            default:
                // Unexpected event type
                response.status(400);
                return "";
            }

            response.status(200);
            return "";
        });
    }
}