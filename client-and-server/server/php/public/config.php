<?php

require_once 'shared.php';

echo json_encode(['publicKey' => $config['stripe_publishable_key'], 'currency' => $config['currency'], 'basePrice' => $config['base_price']]);
