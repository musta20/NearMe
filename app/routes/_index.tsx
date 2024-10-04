import type { MetaFunction } from "@remix-run/node";
import MainMapPage from "~/ui/index/MainMapPage";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <main className="flex h-screen relative overflow-hidden">
 <MainMapPage
 Products={[]} />
  </main>
  );
}