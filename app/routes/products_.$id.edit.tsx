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
import { MapPin } from 'lucide-react'
import { LoaderFunction, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { getProduct, getAllCategories } from "~/lib/action"
import { authenticator } from "~/services/auth.server"

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
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

export const loader: LoaderFunction = async ({ params, request }) => {
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const productId = params.id;
  if (!productId) {
    throw new Response("Not Found", { status: 404 });
  }

  const [product, categories] = await Promise.all([
    getProduct(productId),
    getAllCategories()
  ]);

  if (!product) {
    throw new Response("Not Found", { status: 404 });
  }
  console.log(product.sellerId)
  console.log(userId.id)

  // Check if the current user is the owner of the product
  if (product.sellerId !== userId.id) {
    throw new Response("Unauthorized", { status: 403 });
  }

  return json({ product, categories });
};

export default function EditProduct() {
  const { product, categories } = useLoaderData<typeof loader>();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: product.title,
      description: product.description,
      categoryId: product.categoryId,
      price: product.price.toString(),
      latitude: product.latitude,
      longitude: product.longitude,
      address: product.address,
    },
    mode: "onChange",
  })

  function onSubmit(data: ProductFormValues) {
    toast({
      title: "Product updated",
      description: "Your product has been successfully updated.",
    })
    console.log(data)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Product</CardTitle>
          <CardDescription>Update your product details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
              <div className="h-[300px] bg-gray-100 relative">
                {/* Map placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500">Map View (Placeholder)</p>
                </div>
                {/* Centered pin */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <MapPin className="text-red-500" size={32} />
                </div>
              </div>
              <FormDescription>
                Drag the map to position the pin at your product's location.
              </FormDescription>
              <Button type="submit">Update Product</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}