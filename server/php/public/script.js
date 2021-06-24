// The max and min number of photos a customer can purchase
var MIN_PHOTOS = 1;
var MAX_PHOTOS = 10;

var basicPhotoButton = document.getElementById("basic-photo-button");
document
  .getElementById("quantity-input")
  .addEventListener("change", function (evt) {
    // Ensure customers only buy between 1 and 10 photos
    if (evt.target.value < MIN_PHOTOS) {
      evt.target.value = MIN_PHOTOS;
    }
    if (evt.target.value > MAX_PHOTOS) {
      evt.target.value = MAX_PHOTOS;
    }
  });

/* Method for changing the product quantity when a customer clicks the increment / decrement buttons */
var updateQuantity = function (evt) {
  if (evt && evt.type === "keypress" && evt.keyCode !== 13) {
    return;
  }

  var isAdding = evt && evt.target.id === "add";
  var inputEl = document.getElementById("quantity-input");
  var currentQuantity = parseInt(inputEl.value);

  document.getElementById("add").disabled = false;
  document.getElementById("subtract").disabled = false;

  // Calculate new quantity
  var quantity = evt
    ? isAdding
      ? currentQuantity + 1
      : currentQuantity - 1
    : currentQuantity;
  // Update number input with new value.
  inputEl.value = quantity;
  // Calculate the total amount and format it with currency symbol.
  var amount = config.unitAmount;
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
  var total = (quantity * amount).toFixed(2);
  var formattedTotal = numberFormat.format(total);

  document
    .getElementById("submit")
    .setAttribute("i18n-options", `{ "total": "${formattedTotal}" }`);
  updateContent("button.submit");

  // Disable the button if the customers hits the max or min
  if (quantity === MIN_PHOTOS) {
    document.getElementById("subtract").disabled = true;
  }
  if (quantity === MAX_PHOTOS) {
    document.getElementById("add").disabled = true;
  }
};

/* Attach method */
Array.from(document.getElementsByClassName("increment-btn")).forEach(
  (element) => {
    element.addEventListener("click", updateQuantity);
  }
);
