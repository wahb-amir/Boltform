"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import CheckoutButton from "../components/CheckoutButton";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import ShippingTokenValidator from "../components/ShippingTokenValidator";

const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { data: session, status } = useSession();
  const { cart } = useCart();

  const [address, setAddress] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deliveryFee] = useState(0.75);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    province: "",
    city: "",
    fullAddress: "",
    landmark: "",
  });

  const itemsTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const total = itemsTotal + deliveryFee;

  const handleClick = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const fullAddr = `${form.fullAddress}, ${form.city}, ${form.province}`;
    setAddress(fullAddr);
    setModalOpen(false);

    await axios.post("/api/save", {
      type: "address",
      data: {
        email: session?.user?.email,
        address: fullAddr,
        phone: form.phone,
      },
    });
  };

  useEffect(() => {
    if (session?.user?.email) {
      const getAddress = async () => {
        try {
          const { data } = await axios.get(
            `/api/save?type=address&email=${session.user.email}`
          );
          if (data?.address) setAddress(data.address);
        } catch (err) {
          console.error("❌ Error fetching address:", err.message);
        }
      };
      getAddress();
    }
  }, [session?.user?.email]);

  if (status === "loading") {
    return (
      <p className="p-6 text-gray-700 dark:text-white text-center text-4xl">
        Loading...
      </p>
    );
  }

  return (
    <main className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 mt-12">
      <Suspense fallback={null}>
        <ShippingTokenValidator setLoading={setLoading} />
      </Suspense>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-lg">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Address Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg p-6 w-full max-w-xl shadow-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-4">Enter Your Address</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {["firstName", "lastName", "phone", "landmark", "province", "city", "fullAddress"].map((field, i) => (
                  <div key={i} className={field === "fullAddress" ? "sm:col-span-2" : ""}>
                    <label className="block text-sm font-medium capitalize">
                      {field.replace(/([A-Z])/g, " $1")}
                    </label>
                    {field === "fullAddress" ? (
                      <textarea
                        name={field}
                        rows={2}
                        placeholder="Please enter your full address"
                        className="w-full mt-1 border px-3 py-2 rounded text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        onChange={handleInputChange}
                      />
                    ) : (
                      <input
                        name={field}
                        placeholder={`Enter your ${field}`}
                        className="w-full mt-1 border px-3 py-2 rounded text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        onChange={handleInputChange}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white"
                >
                  SAVE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shipping Section */}
      <section className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-blue-200 dark:border-blue-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Shipping & Billing</h2>
          <button
            onClick={handleClick}
            className="text-blue-500 text-sm hover:underline"
          >
            EDIT
          </button>
        </div>

        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <p className="font-medium">{session?.user?.name || "Guest User"}</p>
          {address ? (
            <p>🏠 HOME — {address}</p>
          ) : (
            <button
              onClick={handleClick}
              className="text-blue-500 hover:underline font-medium"
            >
              Enter your address to continue
            </button>
          )}
        </div>
      </section>

      {/* Package Details */}
      <section className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg mt-6 p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-md font-semibold mb-2">📦 Package 1 of 1</h3>

        {cart.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 mb-4"
          >
            <div className="flex-1">
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {item.brand}, Category: {item.category}
              </p>
            </div>
            <div className="text-right text-sm">
              <p>$ {item.price}</p>
              <p>Qty: {item.quantity}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Order Summary */}
      <section className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg mt-6 p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Invoice & Contact Info</h2>
        <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-4" />
        <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span>
              Items Total ({totalItems} item{totalItems !== 1 ? "s" : ""})
            </span>
            <span>$ {itemsTotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>$ {deliveryFee}</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-2 text-gray-900 dark:text-white">
            <span>Total</span>
            <span>$ {total}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            VAT included, where applicable
          </p>
        </div>

        {/* Block Checkout if no address */}
        <div className="flex w-full items-center justify-center mt-6">
          {address ? (
            <CheckoutButton cart={cart} />
          ) : (
            <button
              onClick={handleClick}
              className="px-6 py-3 text-white bg-red-500 hover:bg-red-600 rounded-lg"
            >
              Enter Address First 🛑
            </button>
          )}
        </div>
      </section>
    </main>
  );
};

export default Page;
