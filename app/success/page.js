// app/success/page.js
import { redirect } from "next/navigation";
import { verifyToken } from "../Utilities/module";
import SuccessClient from "./SuccessClient";

export const runtime = "edge";

export const metadata = {
  title: "Success | Your Ecom",
  description: "Thanks for your purchase!",
};


export default async function SuccessPage({ searchParams }) {
  const token = await searchParams.token;

  if (!token) {
    redirect("/");
  }

  const payload = await verifyToken(token);

  if (!payload) {
    redirect("/");
  }
  
  return <SuccessClient name={payload.name || "customer"} />;
}
