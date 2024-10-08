import { ActionFunction, json } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { uploadImage } from "~/lib/uploadImage.server";
import { updateUser } from "~/lib/action";

export const action: ActionFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const formData = await request.formData();
  const file = formData.get("avatar") as File;
  const id = formData.get("id")
  if (!file) {
    return json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const imageUrl = await uploadImage(file, user.id);

     await updateUser(user.id, { avatarImage: imageUrl });

    return json({ success: true, avatarUrl: imageUrl });
  } catch (error) {
    console.error("Failed to upload avatar:", error);
    return json({ error: "Failed to upload avatar" }, { status: 500 });
  }
};