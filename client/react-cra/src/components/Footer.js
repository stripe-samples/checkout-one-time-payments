import React from 'react';

const Footer = () => {
  return (
    <div className="banner">
      <span>
        {`This is a `}
        <a href="https://github.com/stripe-samples">Stripe Sample</a>
        {` accepting payments with Stripe Checkout. `}
        <a href="https://github.com/stripe-samples/checkout-one-time-payments/tree/master/client-and-server/client/react-cra">
          View code on GitHub.
        </a>
      </span>
    </div>
  );
};

export default Footer;
