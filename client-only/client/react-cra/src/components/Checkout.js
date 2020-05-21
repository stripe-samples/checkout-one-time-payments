import React, { useReducer } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const formatPrice = ({ amount, currency, quantity }) => {
  const numberFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = true;
  for (let part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false;
    }
  }
  amount = zeroDecimalCurrency ? amount : amount / 100;
  const total = (quantity * amount).toFixed(2);
  return numberFormat.format(total);
};

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {
        ...state,
        quantity: state.quantity + 1,
        price: formatPrice({
          amount: state.basePrice,
          currency: state.currency,
          quantity: state.quantity + 1,
        }),
      };
    case 'decrement':
      return {
        ...state,
        quantity: state.quantity - 1,
        price: formatPrice({
          amount: state.basePrice,
          currency: state.currency,
          quantity: state.quantity - 1,
        }),
      };
    case 'setLoading':
      return { ...state, loading: action.payload.loading };
    case 'setError':
      return { ...state, error: action.payload.error };
    default:
      throw new Error();
  }
}

const Checkout = () => {
  const [state, dispatch] = useReducer(reducer, {
    priceId: process.env.REACT_APP_PRICE_ID,
    basePrice: process.env.REACT_APP_BASE_PRICE,
    currency: process.env.REACT_APP_CURRENCY,
    quantity: 1,
    price: formatPrice({
      amount: process.env.REACT_APP_BASE_PRICE,
      currency: process.env.REACT_APP_CURRENCY,
      quantity: 1,
    }),
    loading: false,
    error: null,
  });

  const handleClick = async (event) => {
    // Call your backend to create the Checkout session.
    dispatch({ type: 'setLoading', payload: { loading: true } });
    // When the customer clicks on the button, redirect them to Checkout.
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      mode: 'payment',
      lineItems: [{ price: state.priceId, quantity: state.quantity }],
      successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/canceled`,
    });
    // If `redirectToCheckout` fails due to a browser or network
    // error, display the localized error message to your customer
    // using `error.message`.
    if (error) {
      dispatch({ type: 'setError', payload: { error } });
      dispatch({ type: 'setLoading', payload: { loading: false } });
    }
  };

  return (
    <div className="sr-root">
      <div className="sr-main">
        <header className="sr-header">
          <div className="sr-header__logo"></div>
        </header>
        <section className="container">
          <div>
            <h1>Single photo</h1>
            <h4>Purchase a Pasha original photo</h4>
            <div className="pasha-image">
              <img
                alt="Random asset from Picsum"
                src="https://picsum.photos/280/320?random=4"
                width="140"
                height="160"
              />
            </div>
          </div>
          <div className="quantity-setter">
            <button
              className="increment-btn"
              disabled={state.quantity === 1}
              onClick={() => dispatch({ type: 'decrement' })}
            >
              -
            </button>
            <input
              type="number"
              id="quantity-input"
              min="1"
              max="10"
              value={state.quantity}
              readOnly
            />
            <button
              className="increment-btn"
              disabled={state.quantity === 10}
              onClick={() => dispatch({ type: 'increment' })}
            >
              +
            </button>
          </div>
          <p className="sr-legal-text">Number of copies (max 10)</p>

          <button role="link" onClick={handleClick} disabled={state.loading}>
            {state.loading || !state.price
              ? `Loading...`
              : `Buy for ${state.price}`}
          </button>
          <div className="sr-field-error">{state.error?.message}</div>
        </section>
      </div>
    </div>
  );
};

export default Checkout;
