import { ActionFunction, json } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { PrismaClient } from "@prisma/client";

export const action: ActionFunction = async ({ request }) => {
    const prisma = new PrismaClient();

    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
      });  const formData = await request.formData();
  const productId = formData.get("productId") as string;

  if (!productId) {
    return json({ error: "Product ID is required" }, { status: 400 });
  }

  try {
    await prisma.favorite.delete({
      where: {
        userId_productId: {
          userId:user.id,
          productId,
        },
      },
    });

    return json({ success: true });
  } catch (error) {
    console.error("Error unfavoriting product:", error);
    return json({ error: "Failed to unfavorite product" }, { status: 500 });
  }
};