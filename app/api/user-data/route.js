import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options"; 
import clientPromise from "../../lib/mongodb";
import { NextResponse } from "next/server"; // Use NextResponse for cleaner code

export async function POST(req) {
  // 1. Authenticate the session
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const { type, data } = await req.json();
    const client = await clientPromise;
    const db = client.db("Ecommer_user");

    // 2. Fetch the user from the database to get their MongoDB _id
    const user = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 3. Handle data saving logic based on 'type'
    switch (type) {
      case "cart":
        await db.collection("carts").updateOne(
          { userId: user._id },
          {
            $push: {
              items: { $each: data },
            },
            $set: { updatedAt: new Date() },
          },
          { upsert: true }
        );
        break;

      case "order":
        await db.collection("orders").insertOne({
          userId: user._id,
          items: data.items,
          total: data.total,
          shippingAddressId: data.addressId,
          paymentStatus: "pending",
          orderStatus: "processing",
          createdAt: new Date(),
        });
        break;

      case "address":
        const result = await db.collection("addresses").insertOne({
          userId: user._id,
          ...data,
        });
        return NextResponse.json(
          { addressId: result.insertedId },
          { status: 201 }
        );

      default:
        return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Saved successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Database Error:", err);
    return NextResponse.json(
      { message: "Error saving data", error: err.message },
      { status: 500 }
    );
  }
}
