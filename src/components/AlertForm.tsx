"use client";

import { useState } from "react";
import { useAlertStore } from "@/lib/store";
import { Product } from "@/lib/types";

interface AlertFormProps {
  product: Product;
}

export default function AlertForm({ product }: AlertFormProps) {
  const [targetPrice, setTargetPrice] = useState(
    Math.floor(product.currentLowest * 0.9).toString()
  );
  const [email, setEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const addAlert = useAlertStore((s) => s.addAlert);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (isNaN(price) || !email) return;

    const alert = {
      id: `alert-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      targetPrice: price,
      currentPrice: product.currentLowest,
      isTriggered: product.currentLowest <= price,
      createdAt: new Date().toISOString(),
      email,
    };

    // Save to local store
    addAlert(alert);

    // Also save to API
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert),
      });
    } catch {
      // Continue even if API fails — local store has it
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="bg-amd-gray border border-gray-700 rounded-xl p-6">
      <h3 className="text-white font-semibold text-lg mb-2">
        Set Price Alert
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        Get notified when the price drops to your target.
      </p>

      {showSuccess ? (
        <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-4 text-green-400 text-sm">
          Alert created! You&apos;ll be notified when {product.name} drops to $
          {targetPrice}.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-gray-400 text-sm block mb-1">
              Target Price ($)
            </label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              min="1"
              step="1"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amd-red transition-colors"
              placeholder="Enter target price"
              required
            />
            <p className="text-gray-500 text-xs mt-1">
              Current lowest: ${product.currentLowest}
            </p>
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amd-red transition-colors"
              placeholder="your@email.com"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-amd-red hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Create Alert
          </button>
        </form>
      )}
    </div>
  );
}
