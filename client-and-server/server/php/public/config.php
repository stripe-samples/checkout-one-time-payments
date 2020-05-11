<?php

require_once 'shared.php';

$price = \Stripe\Price::retrieve($config['price']);

echo json_encode(['publicKey' => $config['stripe_publishable_key'], 'unitAmount' => $price['unit_amount'], 'currency' => $price['currency']]);
