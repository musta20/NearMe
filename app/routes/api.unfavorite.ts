import { json, ActionFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { removeFavorite } from "~/lib/action";

export const action: ActionFunction = async ({ request }) => {
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });

    const formData = await request.formData();
    const productId = formData.get("productId") as string;

    if (!productId) {
        return json({ error: "Product ID is required" }, { status: 400 });
    }

    await removeFavorite(user.id, productId);

    return json({ success: true });
};