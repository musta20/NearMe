import { json, ActionFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { createMessage } from "~/lib/action";

export const action: ActionFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const formData = await request.formData();
  const productId = formData.get("productId") as string;
  const message = formData.get("message") as string;

  if (!productId || !message) {
    return json({ error: "Product ID and message are required" }, { status: 400 });
  }

  try {
    const newMessage = await createMessage({
      senderId: user.id,
      receiverId: "", // You need to get the seller's ID here, perhaps by fetching the product details
      productId,
      content: message,
    });

    return json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    return json({ error: "Failed to send message" }, { status: 500 });
  }
};