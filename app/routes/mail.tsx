import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { getInboxMessages, getSentMessages } from "~/lib/action";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Mail, ArrowLeft } from "lucide-react";
import ProductCard from "~/components/ProductCard";

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
   return json<LoaderData>({ inboxMessages, sentMessages });
};
 
const MailItem = ({ subject, sender, preview, onClick }) => (
  <div className="flex items-center space-x-4 p-4  border-b last:border-b-0 cursor-pointer hover:bg-gray-100" onClick={onClick}>
    <Mail className="h-6 w-6 text-gray-400" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{subject}</p>
      <p className="text-sm text-gray-500 truncate">{sender}</p>
      <p className="text-xs text-gray-400 truncate">{preview}</p>
    </div>
  </div>
);

const MailList = ({ messages, onSelectMessage }) => (
  <ScrollArea className="h-[400px]">
    {messages.map((message, index) => (
      <MailItem key={index} subject={message.product.title} sender={message?.sender ? message?.sender?.username : message?.receiver?.username} onClick={() => onSelectMessage(message)} />
    ))}
  </ScrollArea>
);

const MessageView = ({ message, onBack, onReply }) => (
  <div className="space-y-4">
    <Button variant="ghost" onClick={onBack} className="mb-4">
      <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
    </Button>
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{message.product.title}</h3>
      <p className="text-sm text-gray-500">From: {message?.sender ? message?.sender?.username : message?.receiver?.username}</p>
       <ProductCard  imageUrl={message.product?.images[0].imageUrl} price={message.product.price} id={message.product.id} title={message.product.title} />
      <p className="text-md p-5 my-3 ">{message.content}</p>
    </div>
    <div className="space-y-2">
      <h4 className="font-medium">Reply</h4>
      <Textarea placeholder="Type your reply here..." />
      <Button onClick={onReply}>Send Reply</Button>
    </div>
  </div>
);

const MailPage = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("inbox");
  const { inboxMessages, sentMessages } = useLoaderData<LoaderData>();

 
  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
  };

  const handleBack = () => {
    setSelectedMessage(null);
  };

  const handleReply = () => {
    // Implement reply logic here
    console.log("Replied to message:", selectedMessage);
    setSelectedMessage(null);
  };

  return (
    <Card className="w-full max-w-5xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Mail</CardTitle>
        <CardDescription>View your inbox and sent messages</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedMessage ? (
          <MessageView message={selectedMessage} onBack={handleBack} onReply={handleReply} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
            </TabsList>
            <TabsContent value="inbox">
              <MailList messages={inboxMessages} onSelectMessage={handleSelectMessage} />
            </TabsContent>
            <TabsContent value="sent">
              <MailList messages={sentMessages} onSelectMessage={handleSelectMessage} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default MailPage;