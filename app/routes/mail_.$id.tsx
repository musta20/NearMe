import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link, MetaFunction } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { getInboxMessages, getSentMessages } from "~/lib/action";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ScrollArea } from "~/components/ui/scroll-area";

type LoaderData = {
  inboxMessages: any[];
  sentMessages: any[];
};

export const meta: MetaFunction = () => {
 
  return [
    { title: "NearMe - mail" },
    { name: "description", content: "Search for products in your local area. Find nearby items, compare prices, and discover great deals in your neighborhood." },
  ];
};
export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const inboxMessages = await getInboxMessages(user.id);
  const sentMessages = await getSentMessages(user.id);

//   console.log(inboxMessages)
//   console.log(sentMessages)
  return json<LoaderData>({ inboxMessages, sentMessages });
};

export default function Mail() {
  const { inboxMessages, sentMessages } = useLoaderData<LoaderData>();

  const renderMessages = (messages: any[]) => (
    <ScrollArea className="h-[70vh]">
      {messages.map((message) => (
        <div key={message.id} className="border-b p-4 hover:bg-gray-50">
          <Link to={`/mail/${message.id}`} className="block">
            <div className="flex justify-between items-center">
              <span className="font-semibold">
                {message?.sender?.username || message?.receiver?.username}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(message.sentAt).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-600 truncate">{message.content}</p>
          </Link>
        </div>
      ))}
    </ScrollArea>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox">
          <h2 className="text-xl font-semibold mb-2">Inbox</h2>
          {renderMessages(inboxMessages)}
        </TabsContent>
        <TabsContent value="sent">
          <h2 className="text-xl font-semibold mb-2">Sent Messages</h2>
          {renderMessages(sentMessages)}
        </TabsContent>
      </Tabs>
    </div>
  );
}