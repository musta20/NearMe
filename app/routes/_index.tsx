import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import MainMapPage from "~/ui/index/MainMapPage";
import { getAllCategories, getAllProductsOld, getFilteredProducts, getFavoriteProductIds, getProduct } from "~/lib/action";
import type { Product } from "~/types";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }: { request: Request }) => {
  const user = await authenticator.isAuthenticated(request);
  const url = new URL(request.url);
  const category = url.searchParams.get("category") || undefined;
  const minPrice = url.searchParams.get("minPrice") ? Number(url.searchParams.get("minPrice")) : undefined;
  const maxPrice = url.searchParams.get("maxPrice") ? Number(url.searchParams.get("maxPrice")) : undefined;
  const search = url.searchParams.get("search") || undefined;
  const inStock = url.searchParams.get("inStock") === "true";
  const orderBy = url.searchParams.get("orderBy") || undefined;
  const selectedProductId = url.searchParams.get("selectedProductId") || undefined;

  let products = (category || minPrice || maxPrice || search || inStock || orderBy) 
    ? await getFilteredProducts({ category, minPrice, maxPrice, search, inStock, orderBy }) 
    : await getAllProductsOld();
  const categories = await getAllCategories();

  // If a product is selected, fetch its details
  let selectedProduct = selectedProductId 
    ? products.find(p => p.id === selectedProductId)
    : null;

  // If the selected product is not in the products array, fetch it from the database
  if (selectedProductId && !selectedProduct) {
    selectedProduct = await getProduct(selectedProductId);
    if (selectedProduct) {
      // Add the fetched product to the products array
      products = [selectedProduct, ...products];
    }
  }

  // Fetch favorite product IDs
  const favoriteProductIds = user ? await getFavoriteProductIds(user.id) : [];
  
  return json({ products, categories, selectedProduct, favoriteProductIds, user });
};

export default function Index() {
  const { products, categories, selectedProduct, favoriteProductIds, user } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <MainMapPage 
        products={products as Product[]} 
        categories={categories} 
        selectedProduct={selectedProduct}
        favoriteProductIds={favoriteProductIds}
        user={user} // Add this line
      />
    </div>
  );
}