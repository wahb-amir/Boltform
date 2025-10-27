"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import {
  SunIcon,
  MoonIcon,
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();
  const pathName = usePathname();
  const router = useRouter();
  const { cart } = useCart();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navLinks, setNavLinks] = useState([]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const { scrollY } = useScroll();
  const height = useTransform(scrollY, [0, 80], ["80px", "60px"]);
  const fontSize = useTransform(scrollY, [0, 80], ["1.75rem", "1.5rem"]);

  useEffect(() => {
    setMounted(true);
    setNavLinks(["Shop", "Men", "Women", "Track Order"]);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  if (pathName === '/privacy-policy') return <></>;
  return (
    <>
      <motion.nav
        style={{ height }}
        className={`fixed top-0 left-0 w-full z-50 transition-colors border-b
          bg-white/90 dark:bg-[#0b0b0b]/80 backdrop-blur-md
          border-gray-200 dark:border-neutral-800`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-full">
          {/* Logo */}
          <motion.div
            style={{ fontSize }}
            className="font-extrabold tracking-tight text-black dark:text-white"
          >
            <Link href="/">BOLT</Link>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <motion.div
                key={link}
                whileHover={{ scale: 1.1 }}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
              >
                <Link
                  href={
                    link === "Men"
                      ? "/shop?category=mens-shoes"
                      : link === "Women"
                        ? "/shop?category=womens-shoes"
                        : link === "Track Order"
                          ? "/track"
                          : `/${link.toLowerCase()}`
                  }
                  className="flex items-center gap-1"
                >
                  {link === "Track Order" && <TruckIcon className="h-4 w-4" />} {link}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            <motion.div whileTap={{ scale: 0.95 }} className="relative">
              <Link href="/cart">
                <ShoppingCartIcon className="h-6 w-6 text-black dark:text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </motion.div>

            {session ? (
              <div className="relative">
                <img
                  src={session.user.image}
                  alt={session.user.name}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-blue-700 dark:border-white cursor-pointer peer"
                />
                <div
                  className="absolute invisible peer-hover:visible hover:visible opacity-0 peer-hover:opacity-100 hover:opacity-100
               flex flex-col bg-white dark:bg-neutral-900 shadow-xl right-0 mt-2 p-3 rounded-md text-sm z-50
               min-w-[180px] sm:min-w-[220px] transition-all duration-150 ease-in-out pointer-events-auto"
                >
                  <p className="px-3 py-1 text-gray-700 dark:text-gray-200 font-medium truncate">
                    {session.user.name}
                  </p>
                  <button
                    onClick={() => signOut()}
                    className="px-3 py-1 text-left text-red-500 hover:underline transition"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  href="/auth"
                  className="px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-700 text-white hover:bg-blue-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 transition"
                >
                  Sign In
                </Link>
              </motion.div>
            )}

            {/* Theme toggle */}
            {mounted && (
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                aria-label="Toggle Theme"
                whileTap={{ rotate: 20 }}
              >
                {resolvedTheme === "light" ? (
                  <MoonIcon className="h-5 w-5 text-black" />
                ) : (
                  <SunIcon className="h-5 w-5 text-white" />
                )}
              </motion.button>
            )}

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? (
                <XMarkIcon className="h-6 w-6 text-black dark:text-white" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-black dark:text-white" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 bg-white dark:bg-[#0b0b0b] z-40 flex flex-col items-center justify-center space-y-6"
          >
            {navLinks.map((link) => (
              <motion.div key={link} whileHover={{ scale: 1.1 }}>
                <Link
                  href={
                    link === "Men"
                      ? "/shop?category=mens-shoes"
                      : link === "Women"
                        ? "/shop?category=womens-shoes"
                        : link === "Track Order"
                          ? "/track"
                          : `/${link.toLowerCase()}`
                  }
                  className="text-2xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1"
                  onClick={() => setMobileOpen(false)}
                >
                  {link === "Track Order" && <TruckIcon className="h-5 w-5" />} {link}
                </Link>
              </motion.div>
            ))}

            <motion.div whileTap={{ scale: 0.9 }}>
              <Link
                href="/auth"
                className="px-6 py-2 bg-black text-white rounded-full font-semibold dark:bg-white dark:text-black"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}