'use client'

import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { Checkbox } from "~/components/ui/checkbox"
import { json, Link, useActionData, useSubmit } from '@remix-run/react'
import { Icons } from '~/ui/icons'
import { createUserSession, login } from '~/server/session.server'
import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node'
import { getUserId } from '~/server/session.server'

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().default(false),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  
  if (typeof email !== "string" || typeof password !== "string") {
    return json({ formError: `Form not submitted correctly.` }, { status: 400 });
  }

  const user = await login({ email, password });
  if (!user) {
    return json({ formError: `Email/Password combination is incorrect` }, { status: 400 });
  }

  return createUserSession(user.id, '/');
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return null;
};

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  function onSubmit(data: LoginFormValues) {
    submit(data, { method: "post" });
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Log in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {actionData?.formError ? (
                <div className="text-red-600 text-center">{actionData.formError}</div>
              ) : null}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full">Log in</Button>
            </form>
          </Form>
          <Separator />
          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={() => console.log("Login with Google")}>
              <Icons.google className="mr-2 h-4 w-4" />
              Log in with Google
            </Button>
            <Button variant="outline" className="w-full" onClick={() => console.log("Login with Facebook")}>
              <Icons.facebook className="mr-2 h-4 w-4" />
              Log in with Facebook
            </Button>
            <Button variant="outline" className="w-full" onClick={() => console.log("Login with X")}>
              <Icons.twitter className="mr-2 h-4 w-4" />
              Log in with X
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}