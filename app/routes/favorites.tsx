import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { DollarSign, MapPin, Heart } from "lucide-react";
import { getFavotite } from "~/lib/action";
import { authenticator } from "~/services/auth.server";
import { Button } from "~/components/ui/button";

type LoaderData = {
  favoriteProducts: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    address: string;
    images: Array<{ imageUrl: string }>;
  }>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const favoriteProducts = await getFavotite(user.id);

  return json<LoaderData>({ favoriteProducts });
};

export default function Favorites() {
  const { favoriteProducts } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();

  const handleUnfavorite = (productId: string) => {
    fetcher.submit(
      { productId },
      { method: "post", action: "/api/unfavorite" }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Favorite Products</h1>
      {favoriteProducts.length === 0 ? (
        <p className="text-gray-600">You haven't added any products to your favorites yet.</p>
      ) : 
        favoriteProducts.map((item) => (
          
          <div 
            key={item.id} 
            className="bg-white p-4 w-1/2 mx-auto mb-4 rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start">
              {item?.images[0]?.imageUrl && (
                <img src={item.images[0].imageUrl} alt={`Product ${item.title}`} className="w-20 h-20 rounded-lg object-cover mr-4" />
              )}
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                <Link          
           to={`/?selectedProductId=${item.id}`}
          >
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnfavorite(item.id)}
                  >
                    <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                  </Button>
                </div>
                <Link          
           to={`/?selectedProductId=${item.id}`}
          >
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                <div className="flex items-center text-sm text-blue-900">
                  <DollarSign size={16} className="mr-1" />
                  <span>{item.price}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin size={16} className="mr-1" />
                  <span>{item.address}</span>
                </div>
                </Link>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
}
