# Checkout subscription with add-ons with PHP

## Requirements
* PHP

## How to run

1. Confirm `config.ini` configuration

This sample requires a Price ID in the `price` config variable.

Open `config.ini` and confirm `price` is set equal to the ID of a Price from your
Stripe account. It should look something like:

```
price = price_1Hh1ZeCZ6qsJgndJaX9fauRl
```

Note that `price_12345` is a placeholder and the sample will not work with that
price ID. You can [create a price](https://stripe.com/docs/api/prices/create)
from the dashboard or with the Stripe CLI.


2. Run composer to set up dependencies

```
composer install
```

3. Copy config.ini.sample to config.ini and replace with your Stripe API keys

```
cp config.ini.sample config.ini
```

4. Run the server locally

```
cd public
php -S localhost:4242
```

5. If you're using the html client, go to `localhost:4242` to see the demo. For
   react, visit `localhost:3000`.
