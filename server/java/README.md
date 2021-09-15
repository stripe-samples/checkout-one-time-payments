# Checkout single product

## Requirements

- Maven
- Java
- [Configured .env file](../../README.md)

## How to run

1. Confirm `.env` configuration

This sample requires a Price ID in the `PRICE` environment variable.

Open `.env` and confirm `PRICE` is set equal to the ID of a Price from your
Stripe account. It should look something like:

```
PRICE=price_1Hh1ZeCZ6qsJgndJaX9fauRl
```

Note that `price_12345` is a placeholder and the sample will not work with that
price ID. You can [create a price](https://stripe.com/docs/api/prices/create)
from the dashboard or with the Stripe CLI.

<details>
<summary>Enabling Stripe Tax</summary>

   In the [`Server.java`](./src/main/java/com/stripe/sample/Server.java) file you will find the following code commented out
   ```java
   // .setAutomaticTax(SessionCreateParams.AutomaticTax.builder().setEnabled(true).build())
   ```

   Uncomment this line of code and the sales tax will be automatically calculated during the checkout.

   Make sure you previously went through the set up of Stripe Tax: [Set up Stripe Tax](https://stripe.com/docs/tax/set-up) and you have your products and prices updated with tax behavior and optionally tax codes: [Docs - Update your Products and Prices](https://stripe.com/docs/tax/checkout#product-and-price-setup)
</details>


2. Build the jar

```
mvn package
```

2. Run the packaged jar

```
java -cp target/sample-jar-with-dependencies.jar com.stripe.sample.Server
```

4. If you're using the html client, go to `localhost:4242` to see the demo. For
   react, visit `localhost:3000`.
