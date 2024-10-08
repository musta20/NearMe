import React from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { toast } from "~/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Switch } from "~/components/ui/switch"
import { getAllCategories, createProduct } from "~/lib/action"
import { useLoaderData, json, useActionData, redirect, useSubmit } from "@remix-run/react"
import { LoaderFunction, ActionFunction } from "@remix-run/node"
import { authenticator } from "~/services/auth.server"
import DraggableMarker from '~/ui/product/DraggableMarker.client'
import { ClientOnly } from 'remix-utils/client-only'

const productFormSchema = z.object({
  title: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Product description must be at least 10 characters.",
  }),
  categoryId: z.string({
    required_error: "Please select a product category.",
  }),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: "Please enter a valid price (e.g., 10.99)",
  }),
  inStock: z.boolean(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

const defaultValues: Partial<ProductFormValues> = {
  title: "",
  description: "",
  categoryId: "",
  price: "",
  inStock: true,
  latitude: 40.7128,
  longitude: -74.0060,
  address: "",
}

export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const categories = await getAllCategories()
  return json({ categories })
}

export const action: ActionFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const formData = await request.formData();
  const productData = Object.fromEntries(formData);

  try {
    const newProduct = await createProduct({
      ...productData,
      sellerId: user.id,
      price: parseFloat(productData.price as string),
      inStock: productData.inStock === 'true',
      latitude: parseFloat(productData.latitude as string),
      longitude: parseFloat(productData.longitude as string),
    });

    return redirect(`/products/${newProduct.id}/edit`);
  } catch (error) {
    console.error(error);
    return json({ error: "Failed to create product" }, { status: 400 });
  }
};

export default function CreateProduct() {
  const submit = useSubmit();
  const { categories } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const [position, setPosition] = React.useState([defaultValues.latitude, defaultValues.longitude]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
    mode: "onChange",
  })

  React.useEffect(() => {
    if (actionData?.error) {
      toast({
        title: "Error",
        description: actionData.error,
        variant: "destructive",
      })
    }
  }, [actionData])

  React.useEffect(() => {
    if (position) {
      form.setValue("latitude", position[0]);
      form.setValue("longitude", position[1]);
    }
  }, [position, form]);

  function onSubmit(data: ProductFormValues) {
    submit(data, { method: "post" });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Product</CardTitle>
          <CardDescription>Add a new product to your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter product description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inStock"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          In Stock
                        </FormLabel>
                        <FormDescription>
                          Is this product currently in stock?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <input type="hidden" name="latitude" value={position[0]} />
              <input type="hidden" name="longitude" value={position[1]} />
              <div className="h-[300px] bg-gray-100 my-5 overflow-hidden">
                <ClientOnly fallback={<div>Loading map...</div>}>
                  {() => (
                    <DraggableMarker setPosition={setPosition} productPostion={position} />
                  )}
                </ClientOnly>
              </div>
              <FormDescription>
                Drag the map to position the pin at your product's location.
              </FormDescription>
              <Button type="submit">Create Product</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}