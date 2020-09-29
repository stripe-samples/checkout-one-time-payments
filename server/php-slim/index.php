<?php
use Slim\Http\Request;
use Slim\Http\Response;
use Stripe\Stripe;

require 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::create(__DIR__);
$dotenv->load();

require './config.php';

$app = new \Slim\App;

// Instantiate the logger as a dependency
$container = $app->getContainer();
$container['logger'] = function ($c) {
  $settings = $c->get('settings')['logger'];
  $logger = new Monolog\Logger($settings['name']);
  $logger->pushProcessor(new Monolog\Processor\UidProcessor());
  $logger->pushHandler(new Monolog\Handler\StreamHandler(__DIR__ . '/logs/app.log', \Monolog\Logger::DEBUG));
  return $logger;
};

$app->add(function ($request, $response, $next) {
    Stripe::setApiKey(getenv('STRIPE_SECRET_KEY'));
    return $next($request, $response);
});
  
$app->get('/', function (Request $request, Response $response, array $args) {   
    return $response->write(file_get_contents(getenv('STATIC_DIR') . '/index.html'));
});

$app->get('/config', function (Request $request, Response $response, array $args) {
  $pub_key = getenv('STRIPE_PUBLISHABLE_KEY');
  $price = \Stripe\Price::retrieve(getenv('PRICE'));
  return $response->withJson([ 
    'publicKey' => $pub_key, 
    'unitAmount' => $price['unit_amount'], 
    'currency' => $price['currency'] 
  ]);
});

// Fetch the Checkout Session to display the JSON result on the success page
$app->get('/checkout-session', function (Request $request, Response $response, array $args) {
  $id = $request->getQueryParams()['sessionId'];
  $checkout_session = \Stripe\Checkout\Session::retrieve($id);

  return $response->withJson($checkout_session);
});


$app->post('/create-checkout-session', function(Request $request, Response $response, array $args) {
  $domain_url = getenv('DOMAIN');
  $price = getenv('PRICE');
  $body = json_decode($request->getBody());
  $quantity = $body->quantity;

  // Create new Checkout Session for the order
  // Other optional params include:
  // [billing_address_collection] - to display billing address details on the page
  // [customer] - if you have an existing Stripe Customer ID
  // [payment_intent_data] - lets capture the payment later
  // [customer_email] - lets you prefill the email input in the form
  // For full details see https://stripe.com/docs/api/checkout/sessions/create

  // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
  $checkout_session = \Stripe\Checkout\Session::create([
    'success_url' => $domain_url . '/success.html?session_id={CHECKOUT_SESSION_ID}',
    'cancel_url' => $domain_url . '/canceled.html',
    'payment_method_types' => ['card'],
    'mode' => 'payment',
    'line_items' => [[
      'price' => $price,
      'quantity' => $quantity,
    ]]
  ]);
  
  return $response->withJson(array('sessionId' => $checkout_session['id']));
});

$app->post('/webhook', function(Request $request, Response $response) {
    $logger = $this->get('logger');
    $event = $request->getParsedBody();
    // Parse the message body (and check the signature if possible)
    $webhookSecret = getenv('STRIPE_WEBHOOK_SECRET');
    if ($webhookSecret) {
      try {
        $event = \Stripe\Webhook::constructEvent(
          $request->getBody(),
          $request->getHeaderLine('stripe-signature'),
          $webhookSecret
        );
      } catch (\Exception $e) {
        return $response->withJson([ 'error' => $e->getMessage() ])->withStatus(403);
      }
    } else {
      $event = $request->getParsedBody();
    }
    $type = $event['type'];
    $object = $event['data']['object'];

    if($type == 'checkout.session.completed') {
      $logger->info('🔔  Payment succeeded! ');
    }

    return $response->withJson([ 'status' => 'success' ])->withStatus(200);
});

$app->run();
