import { ActionFunction, json, unstable_parseMultipartFormData, unstable_createMemoryUploadHandler } from "@remix-run/node";
import { uploadImage } from "~/lib/uploadImage.server";
import { createProductImage } from "~/lib/action";

export const action: ActionFunction = async ({ request }) => {
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 5_000_000, // 5 MB
  });
  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  
  const files = formData.getAll("file") as File[];
  const productId = formData.get("productId") as string;

  if (files.length === 0 || !productId) {
    return json({ error: "Files and productId are required" }, { status: 400 });
  }

  try {
    const uploadedImages = await Promise.all(
      files.map(async (file, index) => {
        const imageUrl = await uploadImage(file, productId);
        const newImage = await createProductImage({
          imageUrl: imageUrl,
          productId: productId,
          order: index + 1,
          isPrimary: false, // Set the first image as primary
        });
        return { imageUrl: newImage.imageUrl, imageId: newImage.id };
      })
    );

    return json({ images: uploadedImages });
  } catch (error) {
    console.error("Error uploading images:", error);
    return json({ error: "Failed to upload images" }, { status: 500 });
  }
};