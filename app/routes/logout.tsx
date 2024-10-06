import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
 
export const action: ActionFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: "/login" });
};

export const loader: LoaderFunction = async ({request}) => {

  let user = await authenticator.isAuthenticated(request);

  if (!user) {
    // here the user is authenticated
    return redirect("/");
  } else{

   return  await authenticator.logout(request, { redirectTo: "/login" });

  }
  return user;
};

// export const action: ActionFunction = async ({ request }) => {
//   return logout(request);
// };

// export const loader: LoaderFunction = async () => {
//   return redirect("/");
// };