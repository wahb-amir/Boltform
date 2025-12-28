"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const shoes = [
  { color: "orange", hex: "#ce3c24", image: "/bolt-orange.webp" },
  { color: "white", hex: "#ffffff", image: "/bolt-white.webp" },
  { color: "lime", hex: "#264212", image: "/bolt-lime.webp" },
];

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveIndex((p) => (p + 1) % shoes.length);
    }, 4000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleManualSwitch = (index: number) => {
    setActiveIndex(index);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setActiveIndex((p) => (p + 1) % shoes.length);
    }, 4000);
  };

  const active = shoes[activeIndex];

  return (
    <section
      className="w-full min-h-screen px-4 md:px-12 pt-16 pb-12 md:pb-32
        bg-gradient-to-r from-[#b8b6b6] via-[#91c9e3] to-[#6eaae7]
        dark:from-[#0f0c29] dark:via-[#302b63] dark:to-[#24243e]
        text-black dark:text-white flex items-center transition-colors duration-500"
    >
      {/* make this the single stacking context for the hero */}
      <div
        className="max-w-7xl mx-auto w-full relative"
        style={{ isolation: "isolate" }}
      >
        {/* Content area — force it above everything */}
        <div className="relative z-50 max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left relative z-50">
            <p className="text-lg font-medium text-gray-800 dark:text-gray-400 tracking-wide">
              Engineered for Speed
            </p>

            <h1
              className="text-4xl md:text-6xl font-extrabold leading-tight bg-clip-text text-transparent py-1"
              style={{
                background: "linear-gradient(90deg,#ec4899,#ef4444,#f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Bolt Into the Future
              <br />
              with{" "}
              <span
                className="text-blue-700 dark:text-yellow-400"
                style={{
                  background: "none",
                  WebkitTextFillColor: "initial",
                  color: "inherit",
                }}
              >
                BoltForm
              </span>
            </h1>

            <p className="text-gray-800 dark:text-gray-300 text-lg">
              Step into lightning-fast comfort, built for every move.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mt-6">
              <Link href="/shop">
                <button className="text-white dark:bg-white bg-blue-700 dark:text-black px-6 py-3 rounded-full font-semibold hover:scale-105 hover:shadow-xl transition-all">
                  ⚡ Shop Now
                </button>
              </Link>
              <Link href="/shop">
                <button className="text-blue-700 dark:text-blue-400 font-medium hover:underline transition">
                  Explore Collection
                </button>
              </Link>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center m-6">
            <div
              className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px] rounded-full flex items-center justify-center transition-all duration-500 "
              style={{ backgroundColor: active.hex }}
            >
              <div className="w-[240px] sm:w-[300px] md:w-[350px] max-w-full">
                <Image
                  src={active.image}
                  alt={`BoltForm Shoe in ${active.color}`}
                  width={500}
                  height={500}
                  className="w-full h-auto object-contain transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>

            {/* Color Switcher */}
            <div className="flex gap-3 justify-center mt-6">
              {shoes.map((shoe, i) => (
                <button
                  key={shoe.color}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    activeIndex === i
                      ? "border-black dark:border-white scale-110"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  style={{ backgroundColor: shoe.hex }}
                  onClick={() => handleManualSwitch(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
