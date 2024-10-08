import { ActionFunction, json } from "@remix-run/node";
import { setPrimaryProductImage } from "~/lib/action";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const imageId = formData.get("imageId") as string;
  const productId = formData.get("productId") as string;

  if (!imageId || !productId) {
    return json({ error: "Image ID and Product ID are required" }, { status: 400 });
  }

  try {
    const updatedImage = await setPrimaryProductImage(imageId, productId);
    return json({ success: true, primaryImage: updatedImage });
  } catch (error) {
    console.error("Error setting primary image:", error);
    return json({ error: "Failed to set primary image" }, { status: 500 });
  }
};