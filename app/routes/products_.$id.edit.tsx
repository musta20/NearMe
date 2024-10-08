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
import { LoaderFunction, json, redirect } from "@remix-run/node"
import { useLoaderData, useActionData, useSubmit } from "@remix-run/react"
import { getProduct, getAllCategories, updateProduct } from "~/lib/action"
import { authenticator } from "~/services/auth.server"
import { ProductImageGallery } from "~/components/ui/ProductImageGallery"
import { getProductImages } from "~/lib/action"
import DraggableMarker from '~/ui/product/DraggableMarker.client'
import { ClientOnly } from 'remix-utils/client-only'
import { useState, useEffect } from "react"
import { useFetcher } from "@remix-run/react"
import { ActionFunction } from "@remix-run/node";
import { Form as RemixForm } from "@remix-run/react";
import { Switch } from "~/components/ui/switch"

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
  inStock: z.boolean(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const formData = await request.formData();
  const productId = params.id;

  if (!productId) {
    return json({ error: "Product ID is required" }, { status: 400 });
  }

  const product = await getProduct(productId);

  if (!product || product.sellerId !== userId.id) {
    return json({ error: "Unauthorized" }, { status: 403 });
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const price = parseFloat(formData.get("price") as string);
  const latitude = parseFloat(formData.get("latitude") as string);
  const longitude = parseFloat(formData.get("longitude") as string);
  const address = formData.get("address") as string;
  const inStock = formData.get("inStock") === "true";

  try {
    await updateProduct(productId, {
      title,
      description,
      categoryId,
      price,
      latitude,
      longitude,
      address,
      inStock,
    });

    return json({ success: true });
  } catch (error) {
    return json({ error: "Failed to update product" }, { status: 500 });
  }
};

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
   
  // Check if the current user is the owner of the product
  if (product.sellerId !== userId.id) {
    throw new Response("Unauthorized", { status: 403 });
  }

  // Fetch product images as well
  const productImages = await getProductImages(productId);

  return json({ product, categories, productImages });
};

export default function EditProduct() {
  const submit = useSubmit();
  const { product, categories, productImages } = useLoaderData<typeof loader>();
  const actionData = useActionData();
  const [_productImages, setProductImages] = useState(productImages);
  const [newposition, setPosition] = useState([product.latitude, product.longitude]);
  const imageFetcher = useFetcher();
  const primaryImageFetcher = useFetcher();
  const deleteImageFetcher = useFetcher();

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
      inStock: product.inStock,
    },
    mode: "onChange",
  });

  useEffect(() => {
    //console.log(newposition.lat)
    //console.log(newposition.lng)
     if (newposition) {
      form.setValue("latitude", newposition[0]);
      form.setValue("longitude", newposition[1]);
    }
  }, [newposition, form]);

  function onSubmit(data: ProductFormValues) {
    submit(data, { method: "post" });
  }

  const handleDeleteImage = async (imageId: string) => {
    const formData = new FormData();
    formData.append("imageId", imageId);
    formData.append("productId", product.id);

    deleteImageFetcher.submit(formData, {
      method: "POST",
      action: "/api/delete-image",
    });
  };

  const handleUploadImage = async (files: FileList) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }
    formData.append("productId", product.id);

    imageFetcher.submit(formData, {
      method: "POST",
      action: "/api/upload-image",
      encType: "multipart/form-data",
    });
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    const formData = new FormData();
    formData.append("imageId", imageId);
    formData.append("productId", product.id);

    primaryImageFetcher.submit(formData, {
      method: "POST",
      action: "/api/set-primary-image",
    });
  };

  useEffect(() => {
    if (imageFetcher.data?.images) {
      // Add the new images to the productImages state
      setProductImages([...productImages, ...imageFetcher.data.images]);
    }
  }, [imageFetcher.data]);

  useEffect(() => {
    if (primaryImageFetcher.data?.success) {
      // Update the local state to reflect the new primary image
      setProductImages(prevImages => 
        prevImages.map(img => ({
          ...img,
          isPrimary: img.id === primaryImageFetcher.data.primaryImage.id
        }))
      );
      toast({
        title: "Primary image updated",
        description: "The primary image has been successfully updated.",
      });
    }
  }, [primaryImageFetcher.data]);

  useEffect(() => {
    if (deleteImageFetcher.data?.success) {
      // Remove the deleted image from the local state
      setProductImages(prevImages => prevImages.filter(img => img.id !== deleteImageFetcher.data.deletedImageId));
      toast({
        title: "Image deleted",
        description: "The image has been successfully deleted.",
      });
    } else if (deleteImageFetcher.data?.error) {
      toast({
        title: "Error",
        description: deleteImageFetcher.data.error,
        variant: "destructive",
      });
    }
  }, [deleteImageFetcher.data]);

  useEffect(() => {
    if (actionData?.success) {
      toast({
        title: "Product updated",
        description: "Your product has been successfully updated.",
        variant: "default",
      });
    } else if (actionData?.error) {
      toast({
        title: "Update failed",
        description: actionData.error,
        variant: "destructive",
      });
    }
  }, [actionData]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Product</CardTitle>
          <CardDescription>Update your product details</CardDescription>
        </CardHeader>
        <CardContent>
          <RemixForm method="post" onSubmit={form.handleSubmit(onSubmit)}>
            <Form {...form}>
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
              <input type="hidden" name="latitude" value={newposition[0]} />
              <input type="hidden" name="longitude" value={newposition[1]} />
              <div className="h-[300px] bg-gray-100 my-5 overflow-hidden">
                <ClientOnly fallback={<div>Loading map...</div>}>
                  {() => (
                    <DraggableMarker setPosition={setPosition} productPostion={newposition} />
                  )}
                </ClientOnly>
              </div>
              <FormDescription>
                Drag the map to position the pin at your product's location.
              </FormDescription>
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
                        Toggle if the product is currently in stock
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
              <div>
                <h3 className="text-lg font-semibold mb-2">Product Images</h3>
                <ProductImageGallery
                  images={_productImages}
                  onDelete={handleDeleteImage}
                  onUpload={handleUploadImage}
                  onSetPrimary={handleSetPrimaryImage}
                />
              </div>

              <Button type="submit" className="my-2" >Update Product</Button>
            </Form>
          </RemixForm>
        </CardContent>
      </Card>
      {actionData?.error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {actionData.error}
        </div>
      )}
    </div>
  )
}