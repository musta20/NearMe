import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { getProduct, createMessage } from "~/lib/action";
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import ProductCard from '~/components/ProductCard';

type LoaderData = {
  product: any;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const productId = params.productId;
  if (!productId) {
    throw new Response("Not Found", { status: 404 });
  }

  const product = await getProduct(productId);
  if (!product) {
    throw new Response("Not Found", { status: 404 });
  }

  return json<LoaderData>({ product });
};

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
      receiverId: formData.get("sellerId") as string,
      productId,
      content: message,
    });

    return json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    return json({ error: "Failed to send message" }, { status: 500 });
  }
};

export default function SendMessage() {
  const { product } = useLoaderData<LoaderData>();
  const actionData = useActionData();

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Contact Seller</h1>
      <ProductCard
        id={product.id}
        title={product.title}
        price={product.price}
        imageUrl={product.images?.[0]?.imageUrl}
      />
      <Form method="post" className="mt-6">
        <input type="hidden" name="productId" value={product.id} />
        <input type="hidden" name="sellerId" value={product.sellerId} />
        <Textarea
          name="message"
          placeholder="Type your message here..."
          className="mb-4"
          required
        />
        <Button type="submit">Send Message</Button>
      </Form>
      {actionData?.success && (
        <p className="mt-4 text-green-600">Message sent successfully!</p>
      )}
      {actionData?.error && (
        <p className="mt-4 text-red-600">{actionData.error}</p>
      )}
    </div>
  );
}