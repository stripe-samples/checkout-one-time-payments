<?php

require '../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

$price = $_ENV['PRICE'];
if (!$price || $price == 'price_12345') {
  http_response_code(500);
  echo "You must set a Price ID in the `.env` file. Please see the README";
  exit;
}

// For sample support and debugging. Not required for production:
\Stripe\Stripe::setAppInfo(
  "stripe-samples/checkout-one-time-payments",
  "0.0.2",
  "https://github.com/stripe-samples/checkout-one-time-payments"
);

\Stripe\Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
  echo 'Invalid request';
  exit;
}

$domain_url = $_ENV['DOMAIN'];
$quantity = $_POST['quantity'];

// Create new Checkout Session for the order
// Other optional params include:
// [billing_address_collection] - to display billing address details on the page
// [customer] - if you have an existing Stripe Customer ID
// [customer_email] - lets you prefill the email input in the form
// [automatic_tax] - to automatically calculate sales tax, VAT and GST in the checkout page
// For full details see https://stripe.com/docs/api/checkout/sessions/create
// ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
$checkout_session = \Stripe\Checkout\Session::create([
  'success_url' => $domain_url . '/success.html?session_id={CHECKOUT_SESSION_ID}',
  'cancel_url' => $domain_url . '/canceled.html',
  'mode' => 'payment',
  // 'automatic_tax' => ['enabled' => true],
  'line_items' => [[
    'price' => $price,
    'quantity' => $quantity,
  ]]
]);

header("HTTP/1.1 303 See Other");
header("Location: " . $checkout_session->url);
