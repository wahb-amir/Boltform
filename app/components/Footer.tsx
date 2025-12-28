"use client";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
const darkLinkClass = "text-sky-400 hover:text-sky-300";

const Footer = () => {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (pathname !== "/" && pathname !== "/shop") return null;

  const isDark = resolvedTheme === "dark";

  return (
    <footer
      className={`
        py-4 border-t
        transition-colors duration-300
        ${
          isDark
            ? "bg- border-neutral-800"
            : "bg-white border-blue-200"
        }
      `}
    >
      <div
        className={`text-center text-sm ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        &copy; {new Date().getFullYear()} Powered by{" "}
        <a
          href="https://wahb.space"
          target="_blank"
          rel="noopener noreferrer"
          className={`
            font-semibold
            transition-colors duration-200
            ${isDark ? darkLinkClass : "text-blue-700 hover:text-blue-800"}
            hover:underline
          `}
        >
          wahb.space
        </a>
      </div>
    </footer>
  );
};

export default Footer;
