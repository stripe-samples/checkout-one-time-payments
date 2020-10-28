# Checkout single product

A [Sinatra](http://sinatrarb.com/) implementation.

## Requirements
* Ruby v2.4.5+
* [Configured .env file](../README.md)

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

2. Install dependencies
```
bundle install
```

3. Run the application

```
ruby server.rb
```

4. If you're using the html client, go to `localhost:4242` to see the demo. For react, visit `localhost:3000`.
