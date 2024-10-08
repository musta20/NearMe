import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { DollarSign, MapPin } from "lucide-react";
import { getFavotite } from "~/lib/action";
import { authenticator } from "~/services/auth.server";
// import { requireUserId } from "~/utils/auth.server";

type LoaderData = {
  favoriteProducts: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Favorite Products</h1>
      {favoriteProducts.length === 0 ? (
        <p className="text-gray-600">You haven't added any products to your favorites yet.</p>
      ) : 
        favoriteProducts.map((item: any) => {
         
  
   
            return (
              <div 
                key={item.id} 
                className={`bg-white p-4 w-1/2 mx-auto mb-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer `}
                //onClick={() => onClick(item.id)}
              >
                <div className="flex items-start ">
                  {item?.images[0]?.imageUrl && (
                    <img src={item?.images[0]?.imageUrl} alt={`Product ${item.title}`} className="w-20 h-20 rounded-lg object-cover mr-4" />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    {/* <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p> */}
                    <div className="flex items-center text-sm text-blue-900">
                      <DollarSign size={16} className="mr-1" />
                      <span>{item.price}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin size={16} className="mr-1" />
                      <span>{item.address}</span>
                    </div>
              
                  </div>
                </div>
              </div>
            );
          })
      }
    </div>
  );
}
