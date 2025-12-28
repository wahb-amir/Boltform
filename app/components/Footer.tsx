"use client";
import { usePathname } from "next/navigation";
const Footer = () => {
  const pathname = usePathname();

  if (pathname !== "/" && pathname !== "/shop") return null;

  return (
    <footer className="bg-white border-t border-blue-200 py-4 border-[3px]">
      <div className="text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Powered by{" "}
        <a
          href="https://wahb.space"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-700 hover:text-blue-800 hover:underline transition-colors duration-200"
        >
          wahb.space
        </a>
      </div>
    </footer>
  );
};

export default Footer;
