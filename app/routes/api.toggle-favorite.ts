import { ActionFunction, json } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { toggleFavorite } from "~/lib/action";

export const action: ActionFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const formData = await request.formData();
  const productId = formData.get("productId") as string;

  if (!productId) {
    return json({ error: "Product ID is required" }, { status: 400 });
  }

  try {
    const updatedFavorite = await toggleFavorite(user.id, productId);
    return json({ success: true, isFavorite: updatedFavorite.isFavorite });
  } catch (error) {
    console.error("Failed to toggle favorite:", error);
    return json({ error: "Failed to toggle favorite" }, { status: 500 });
  }
};