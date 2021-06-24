// The max and min number of photos a customer can purchase
var MIN_PHOTOS = 1;
var MAX_PHOTOS = 10;

var quantityInput = document.getElementById('quantity-input');
quantityInput.addEventListener('change', function (e) {
  // Ensure customers only buy between 1 and 10 photos
  if (quantityInput.value < MIN_PHOTOS) {
    quantityInput.value = MIN_PHOTOS;
  }
  if (quantityInput.value > MAX_PHOTOS) {
    quantityInput.value = MAX_PHOTOS;
  }
});

/* Method for changing the product quantity when a customer clicks the increment / decrement buttons */
var addBtn = document.getElementById("add");
var subtractBtn = document.getElementById("subtract");
var updateQuantity = function (evt) {
  if (evt && evt.type === 'keypress' && evt.keyCode !== 13) {
    return;
  }
  var delta = evt && evt.target.id === 'add' && 1 || -1;

  addBtn.disabled = false;
  subtractBtn.disabled = false;

  // Update number input with new value.
  quantityInput.value = parseInt(quantityInput.value) + delta;

  // Disable the button if the customers hits the max or min
  if (quantityInput.value == MIN_PHOTOS) {
    subtractBtn.disabled = true;
  }
  if (quantityInput.value == MAX_PHOTOS) {
    addBtn.disabled = true;
  }
};

addBtn.addEventListener('click', updateQuantity);
subtractBtn.addEventListener('click', updateQuantity);
