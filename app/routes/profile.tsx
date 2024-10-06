import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { toast } from "~/hooks/use-toast"
import { ActionFunction, LoaderFunctionArgs } from "@remix-run/node"
import { authenticator } from "~/services/auth.server"
import { useLoaderData, useActionData, json, Form as RemixForm, useSubmit } from "@remix-run/react"
import { getUser, updateUser } from "~/lib/action"
import { useEffect } from "react"

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    }),
  bio: z.string().max(160).min(4),
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(50, {
      message: "Name must not be longer than 50 characters.",
    }),
    address: z.string().max(100).optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export const action: ActionFunction = async ({ request }) => {
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });


  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  //console.log(formData)

  try {
    await updateUser(userId.id, updates);
    return json({ success: true });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return json({ error: "Failed to update profile" }, { status: 400 });
  }
};

export default function ProfileEditPage() {
  const user = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user.username || "",
      email: user.email || "",
      bio: user.bio || "",
      name: user.name || "",
      address: user.address || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (actionData?.success) {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } else if (actionData?.error) {
      toast({
        title: "Error",
        description: actionData.error,
        variant: "destructive",
      });
    }
  }, [actionData]);

  function onSubmit(data: ProfileFormValues) {
    submit(data, { method: "post" });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RemixForm method="post" onSubmit={form.handleSubmit(onSubmit)}>
            <Form {...form}>
              <div className="space-y-8">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your public display name. It can be your real name or a pseudonym.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        We'll never share your email with anyone else.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us a little bit about yourself"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        You can @mention other users and organizations to link to them.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="New York, USA" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your Address will help us provide more relevant content.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Update profile</Button>
              </div>
            </Form>
          </RemixForm>
        </CardContent>
      </Card>
    </div>
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  let userId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const user = await getUser(userId.id);

  if (!user) {
    throw new Response("Not Found", { status: 404 });
  }

  return user;
};
