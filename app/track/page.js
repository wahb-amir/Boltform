"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TruckIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  DocumentArrowDownIcon,
  PhoneIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";

export default function TrackOrder() {
  const { data: session } = useSession();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [ordersHistory, setOrdersHistory] = useState([]);
  const [mockMode, setMockMode] = useState(true);

  useEffect(() => {
    // Load user's past orders (mock or API)
    if (session) {
      // Replace with real API call
      setOrdersHistory([mockResponse('ORD-1001'), mockResponse('ORD-1002'), mockResponse('ORD-1003')]);
    }
  }, [session]);

  async function fetchTracking(oid, emailParam) {
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      // Real API call placeholder
      const res = await fetch(`/api/track?orderId=${encodeURIComponent(oid)}&email=${encodeURIComponent(emailParam || "")}`);
      if (!res.ok) {
        if (mockMode) {
          await new Promise((r) => setTimeout(r, 600));
          setOrder(mockResponse(oid));
        } else {
          throw new Error("Tracking info not found");
        }
      } else {
        const data = await res.json();
        setOrder(data);
      }
    } catch (err) {
      if (mockMode) {
        setOrder(mockResponse(oid));
      } else {
        setError(err.message || "Failed to fetch tracking info");
      }
    }

    setLoading(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!orderId.trim()) return setError("Please enter an Order ID.");
    fetchTracking(orderId.trim(), email.trim());
  }

  function copyOrderId() {
    if (!order) return;
    navigator.clipboard.writeText(order.orderId);
  }

  function downloadInvoice() {
    if (!order) return;
    const content = `Order#: ${order.orderId}\nStatus: ${order.status}\nTotal: ${order.total}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${order.orderId}-invoice.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-start py-16 px-4 space-y-10">
      {/* Track Current Order */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-1 bg-white/70 dark:bg-[#070707]/70 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 shadow">
          <h2 className="text-lg font-bold mb-2">Track Your Order</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Enter your order ID to view live tracking.</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Order ID" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-transparent outline-none" />
            <div className="flex items-center gap-2">
              <button type="submit" className="flex-1 px-4 py-2 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold shadow">{loading ? 'Checking…' : 'Track'}</button>
            </div>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </form>

          {order && (
            <div className="mt-6 border-t pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-900"><TruckIcon className="h-5 w-5" /></div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Order</div>
                    <div className="font-semibold">{order.orderId}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copyOrderId} className="px-2 py-1 rounded-md border text-sm">Copy</button>
                  <button onClick={downloadInvoice} className="px-2 py-1 rounded-md border text-sm flex items-center gap-2"><DocumentArrowDownIcon className="h-4 w-4" />Invoice</button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Timeline + items for current order */}
        <motion.div className="lg:col-span-2 space-y-6">
          {order ? <CurrentOrderDetail order={order} /> : <p className="text-gray-500 text-center">No current order selected</p>}
        </motion.div>
      </div>

      {/* Orders History */}
      <div className="w-full max-w-6xl space-y-6">
        <h2 className="text-xl font-bold">Order History</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ordersHistory.length ? ordersHistory.map((ord, idx) => (
            <div key={idx} className="bg-white/70 dark:bg-[#070707]/70 border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 shadow flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{ord.orderId}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{ord.status}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total: {ord.total}</div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => setOrder(ord)} className="flex-1 px-2 py-1 rounded-full border border-gray-200 dark:border-neutral-800 text-sm">View</button>
                <button onClick={() => navigator.clipboard.writeText(ord.orderId)} className="px-2 py-1 rounded-full border text-sm">Copy ID</button>
              </div>
            </div>
          )) : <p className="text-gray-500">No past orders found.</p>}
        </div>
      </div>
    </div>
  );
}

function CurrentOrderDetail({ order }) {
  let activeIdx = order.events.length -1
  return (
    <div className="bg-white/70 dark:bg-[#070707]/70 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 shadow">
      <h3 className="font-semibold mb-3">Tracking Events for {order.orderId}</h3>
      <div className="space-y-4">
        {order.events.map((ev, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="mt-1">
              <div className={`w-9 h-9 rounded-full grid place-items-center ${idx === activeIdx ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-neutral-900 text-gray-700'}`}>
                <CheckIcon className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">{ev.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{ev.time} — {ev.location}</div>
              {ev.note && <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{ev.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function mockResponse(oid = 'ORD-00001') {
  const now = new Date();
  const fmt = (d) => d.toLocaleString();
  return {
    orderId: oid,
    status: 'Shipped',
    progress: 2,
    carrier: 'Bolt Logistics',
    eta: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    total: 'PKR 6,499',
    items: [
      { title: 'BOLT Runner Sneakers', qty: 1, price: 'PKR 4,999', image: '/images/sample-shoe.jpg', variant: 'Black / 42' },
      { title: 'Grip Socks (2-pack)', qty: 1, price: 'PKR 1,500', image: '/images/sample-socks.jpg' },
    ],
    events: [
      { title: 'Shipped from warehouse', time: fmt(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)), location: 'Lahore, PK', note: 'Your order has left the warehouse.' },
      { title: 'In transit', time: fmt(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)), location: 'Islamabad, PK', note: 'Your package is on the way.' },
      { title: 'Out for delivery', time: fmt(new Date(now.getTime() + 6 * 60 * 60 * 1000)), location: 'Rawalpindi, PK', note: 'Your package is out for delivery.' },
      { title: 'Delivered', time: fmt(new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)), location: 'Your Address', note: 'Package delivered successfully.' },]
  };
}
