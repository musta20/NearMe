import { ActionFunction, json } from "@remix-run/node";
import { deleteProductImage } from "~/lib/action";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const imageId = formData.get("imageId") as string;
  const productId = formData.get("productId") as string;

  if (!imageId || !productId) {
    return json({ error: "Image ID and Product ID are required" }, { status: 400 });
  }

  try {
    const deletedImage = await deleteProductImage(imageId, productId);
    return json({ success: true, deletedImageId: deletedImage.id });
  } catch (error) {
    console.error("Error deleting image:", error);
    return json({ error: "Failed to delete image" }, { status: 500 });
  }
};