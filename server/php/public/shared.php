<?php

require '../vendor/autoload.php';

header('Content-Type: application/json');

$config = parse_ini_file('../config.ini');

// Make sure the configuration file is good.
if (!$config) {
  http_response_code(500);
  echo json_encode([ 'error' => 'Internal server error.' ]);
  exit;
}

$price = $config['price'];
if (!$price || $price == 'price_12345') {
  http_response_code(500);
  echo "You must set a Price ID in the config.ini file. Please see the README";
  exit;
}

// For sample support and debugging. Not required for production:
\Stripe\Stripe::setAppInfo(
  "stripe-samples/checkout-one-time-payments",
  "0.0.1",
  "https://github.com/stripe-samples/checkout-one-time-payments"
);

\Stripe\Stripe::setApiKey($config['stripe_secret_key']);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $input = file_get_contents('php://input');
  $body = json_decode($input);
}

if (json_last_error() !== JSON_ERROR_NONE) {
  http_response_code(400);
  echo json_encode([ 'error' => 'Invalid request.' ]);
  exit;
}
