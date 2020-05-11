/* Method for changing the submit text when the amount is changed */
var updateAmount = function (evt) {
  if (evt && evt.type === "keypress" && evt.keyCode !== 13) {
    return;
  }

  var inputEl = document.getElementById("amount-input");
  var amount = parseInt(inputEl.value);

  // Calculate the total amount and format it with currency symbol.
  var numberFormat = new Intl.NumberFormat(i18next.language, {
    style: "currency",
    currency: config.currency,
    currencyDisplay: "symbol",
  });
  var parts = numberFormat.formatToParts(amount);
  var zeroDecimalCurrency = true;
  for (var part of parts) {
    if (part.type === "decimal") {
      zeroDecimalCurrency = false;
    }
  }
  amount = zeroDecimalCurrency ? amount : amount / 100;
  var total = amount.toFixed(2) * 100;
  var formattedTotal = numberFormat.format(total);

  document
    .getElementById("submit")
    .setAttribute("i18n-options", `{ "total": "${formattedTotal}" }`);
  updateContent("button.submit");

};

/* Attach method */
document.getElementById("amount-input").addEventListener("change", updateAmount);

// Create a Checkout Session with the selected amount
var createCheckoutSession = function (stripe) {
  var inputEl = document.getElementById("amount-input");
  var amount = parseInt(inputEl.value) * 100;

  return fetch("create-checkout-session.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
        amount: amount,
    }),
  }).then(function (result) {
    return result.json();
  });
};

// Handle any errors returned from Checkout
var handleResult = function (result) {
  if (result.error) {
    var displayError = document.getElementById("error-message");
    displayError.textContent = result.error.message;
  }
};

/* Method for getting query string parameter by name */
var getParameterByName = function (name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

/* Method for getting the "amt" variable from the query string in case it is provided */
var getAmountFromQueryString = function() {
    var amt = getParameterByName("amt");
    if (amt) {
        var inputEl = document.getElementById("amount-input");
        inputEl.value = amt;
    }
}

/* Get your Stripe publishable key to initialize Stripe.js */
fetch("config.php")
  .then(function (result) {
    return result.json();
  })
  .then(function (json) {
    window.config = json;
    var stripe = Stripe(config.publicKey);
    getAmountFromQueryString();
    updateAmount();
    // Setup event handler to create a Checkout Session on submit
    document.querySelector("#submit").addEventListener("click", function (evt) {
      createCheckoutSession().then(function (data) {
        stripe
          .redirectToCheckout({
            sessionId: data.sessionId,
          })
          .then(handleResult);
      });
    });
  });
