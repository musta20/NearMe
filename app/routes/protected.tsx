import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/server/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  return json({ userId });
};

export default function Protected() {
  const { userId } = useLoaderData();
  return (
    <div>
      <h1>Protected Route</h1>
      <p>Your user ID is: {userId}</p>
    </div>
  );
}