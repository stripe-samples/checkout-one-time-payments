<?php

require '../vendor/autoload.php';

header('Content-Type: application/json');

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
  "0.0.1",
  "https://github.com/stripe-samples/checkout-one-time-payments"
);

// Don't put any keys in code. Use an environment variable (as shown
// here) or secrets vault to supply keys to your integration.
//
// See https://docs.stripe.com/keys-best-practices and find your
// keys at https://dashboard.stripe.com/apikeys.
\Stripe\Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $input = file_get_contents('php://input');
  $body = json_decode($input);
}

if (json_last_error() !== JSON_ERROR_NONE) {
  http_response_code(400);
  echo json_encode([ 'error' => 'Invalid request.' ]);
  exit;
}
