import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
// import { cssBundleHref } from "@remix-run/css-bundle";

import "./tailwind.css";
import Header from "./ui/index/header";
import { Toaster } from "./components/ui/toaster";
import { authenticator } from "./services/auth.server";
import { getUser } from "./lib/action";
import styles from "./tailwind.css?url"
 
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  // ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
]
export function Layout({ children }: { children: React.ReactNode }) {
  const user = useLoaderData();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>

      <div className="flex flex-col h-screen">
      <Header user = {user} />

        {children}
        <Toaster /> 

        <ScrollRestoration />
        <Scripts />
        </div>
      </body>
    </html>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  // If the user is already authenticated redirect to /dashboard directly
  let userId = await authenticator.isAuthenticated(request);
  if(!userId) return false;
   let user= await getUser(userId?.id);
  return user;
};

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}

export default function App() {
  return <Outlet />;
}
