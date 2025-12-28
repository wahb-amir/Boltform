import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import clientPromise from "../../lib/mongodb";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ message: "Not authenticated" }), {
      status: 401,
    });
  }

  const { type, data } = await req.json();
  const client = await clientPromise;
  const db = client.db("Ecommer_user");

  const user = await db
    .collection("users")
    .findOne({ email: session.user.email });
  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
    });
  }

  try {
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
        return new Response(JSON.stringify({ addressId: result.insertedId }), {
          status: 201,
        });

      default:
        return new Response(JSON.stringify({ message: "Invalid type" }), {
          status: 400,
        });
    }

    return new Response(JSON.stringify({ message: "Saved" }), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ message: "Error saving data", error: err.message }),
      { status: 500 }
    );
  }
}
