import React, { useMemo, useEffect } from 'react'
import { MoreHorizontal ,Trash, Pencil, ArrowUpDown, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "~/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { json, Link, useLoaderData, useSearchParams } from "@remix-run/react"
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node"
import { authenticator } from "~/services/auth.server"
import { deleteProduct, getUserProducts } from "~/lib/action"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { toast } from "~/hooks/use-toast"
import { Form, useSubmit } from "@remix-run/react"

// Assume we have a Product type defined
type Product = {
  id: string
  title: string
  // ... other product properties
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const products = await getUserProducts(userId.id);
  const url = new URL(request.url);
  const deleted = url.searchParams.get('deleted') === 'true';

  return json({ products, deleted });
};

export default function SellerProductList() {
  const { products, deleted } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    if (deleted) {
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      });
    }
  }, [deleted]);

  const [searchTerm, setSearchTerm] = React.useState("")
  const [sortColumn, setSortColumn] = React.useState<keyof (typeof products)[0] | null>(null)
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedProducts = useMemo(() => {
    if (!sortColumn) return filteredProducts

    return [...filteredProducts].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredProducts, sortColumn, sortDirection])

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)

  const handleSort = (column: keyof (typeof products)[0]) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null)
  const submit = useSubmit()

  const handleDeleteClick = (product: Product) => {
     setProductToDelete(product)
  }

  const handleDeleteConfirm = () => {
      if (productToDelete) {
      const formData = new FormData()
      formData.append('_action', 'deleteProduct')
      formData.append('productId', productToDelete.id)
       submit(formData, { method: 'post' })
      
      // Update the local state to remove the product
      //setProducts(products.filter(p => p.id !== productToDelete.id))
      
      // Show a success toast
      // toast({
      //   title: "Product deleted",
      //   description: "The product has been successfully deleted.",
      // })
      
      // Reset the productToDelete state
      setProductToDelete(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Your Products</CardTitle>
              <CardDescription>Manage and view all your listed products</CardDescription>
            </div>
            <Link to={"/products/new"}>
            <Button>

              <Plus className="mr-2 h-4 w-4" /> Add New Product
              </Button>

              </Link>

          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('title')}>
                    Name <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('price')}>
                    Price <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('createdAt')}>
                    Created At <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.title}</TableCell>
                  <TableCell>${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</TableCell>
                  <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />

                          <Link to={`/products/${product.id}/edit`}>
                          Edit product
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='cursor-pointer' onSelect={() => handleDeleteClick(product)}>
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} entries
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((old) => Math.max(old - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((old) => Math.min(old + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={!!productToDelete} //onOpenChange={() => setProductToDelete(null)}
        >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{productToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Form method="post" onSubmit={(event) => {
              event.preventDefault()
              handleDeleteConfirm()
            }}>
        
              <AlertDialogAction type="submit">
                Delete
              </AlertDialogAction>
            </Form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get('_action');

  if (action === 'deleteProduct') {
    const productId = formData.get('productId');
    if (typeof productId !== 'string') {
      return json({ error: "Invalid product ID" }, { status: 400 });
    }

    try {
      await deleteProduct(productId);
      return redirect('/products?deleted=true');
    } catch (error) {
      console.error("Failed to delete product:", error);
      return json({ error: "Failed to delete product" }, { status: 400 });
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
};