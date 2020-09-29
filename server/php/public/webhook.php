<?php

require_once 'shared.php';

$event = null;

try {
	// Make sure the event is coming from Stripe by checking the signature header
	$event = \Stripe\Webhook::constructEvent($input, $_SERVER['HTTP_STRIPE_SIGNATURE'], $config['stripe_webhook_secret']);
}
catch (Exception $e) {
	http_response_code(403);
	echo json_encode([ 'error' => $e->getMessage() ]);
	exit;
}

$details = '';

$type = $event['type'];
$object = $event['data']['object'];

if($type == 'checkout.session.completed') {
  error_log('🔔  Checkout Session was completed!');
} else {
	error_log('🔔  Other webhook received! ' . $type);
}

$output = [
	'status' => 'success'
];

echo json_encode($output, JSON_PRETTY_PRINT);
