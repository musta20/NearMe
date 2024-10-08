import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import MainMapPage from "~/ui/index/MainMapPage";
import { getAllCategories, getAllProductsOld, getFilteredProducts } from "~/lib/action";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") || undefined;
  const minPrice = url.searchParams.get("minPrice") ? Number(url.searchParams.get("minPrice")) : undefined;
  const maxPrice = url.searchParams.get("maxPrice") ? Number(url.searchParams.get("maxPrice")) : undefined;
  const search = url.searchParams.get("search") || undefined;
  const inStock = url.searchParams.get("inStock") === "true";
  const orderBy = url.searchParams.get("orderBy") || undefined;

  const products = (category || minPrice || maxPrice || search || inStock || orderBy) 
    ? await getFilteredProducts({ category, minPrice, maxPrice, search, inStock, orderBy }) 
    : await getAllProductsOld();
  const categories = await getAllCategories();

  return json({ products, categories });
};

export default function Index() {
  const { products, categories } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <MainMapPage products={products} categories={categories} />
    </div>
  );
}