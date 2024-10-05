import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllProductsOld } from "~/lib/action";
import MainMapPage from "~/ui/index/MainMapPage";

export const loader: LoaderFunction = async () => {
  try {
    const products = await getAllProductsOld();
    return json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return json({ products: [], error: "Failed to fetch products" }, { status: 500 });
  }
};

export default function Index() {

  const { products } = useLoaderData<typeof loader>();

  return (
    <main className="flex h-screen relative overflow-hidden">
               <MainMapPage products={products} />
              </main>     
            
            );

}