"use client";

import { useState } from "react";
import Image from "next/image";

const MIN_PHOTOS = 1;
const MAX_PHOTOS = 10;

export default function Home() {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => {
    if (quantity < MAX_PHOTOS) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > MIN_PHOTOS) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-2">Single photo</h1>
          <p className="text-gray-600 mb-6">Purchase a Pasha original photo</p>

          <div className="flex justify-center mb-6">
            <Image
              src="https://picsum.photos/280/320?random=4"
              alt="Product"
              width={140}
              height={160}
              className="rounded-md"
              unoptimized
            />
          </div>

          <form action="/api/create-checkout-session" method="POST">
            <div className="flex items-center justify-center gap-4 mb-2">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= MIN_PHOTOS}
                className="w-10 h-10 rounded-full bg-stripe-light text-stripe-dark font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                -
              </button>
              <input
                type="number"
                name="quantity"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || MIN_PHOTOS;
                  setQuantity(Math.min(MAX_PHOTOS, Math.max(MIN_PHOTOS, val)));
                }}
                min={MIN_PHOTOS}
                max={MAX_PHOTOS}
                className="w-16 text-center text-xl font-semibold border rounded-md py-2"
              />
              <button
                type="button"
                onClick={handleIncrement}
                disabled={quantity >= MAX_PHOTOS}
                className="w-10 h-10 rounded-full bg-stripe-light text-stripe-dark font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                +
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mb-6">
              Number of copies (max 10)
            </p>

            <button
              type="submit"
              className="w-full bg-stripe-purple text-white py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors"
            >
              Buy
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
