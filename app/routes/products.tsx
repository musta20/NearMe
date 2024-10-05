import React, { useMemo } from 'react'
import { MoreHorizontal, ArrowUpDown, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
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

const products = [
  { name: "Eco-friendly Water Bottle", category: "Home & Kitchen", price: 15.99, stock: 50, status: "Active" },
  { name: "Wireless Earbuds", category: "Electronics", price: 79.99, stock: 30, status: "Active" },
  { name: "Organic Cotton T-Shirt", category: "Clothing", price: 24.99, stock: 100, status: "Active" },
  { name: "Smart Home Security Camera", category: "Electronics", price: 129.99, stock: 20, status: "Inactive" },
  { name: "Yoga Mat", category: "Sports & Outdoors", price: 29.99, stock: 75, status: "Active" },
  { name: "Stainless Steel Cookware Set", category: "Home & Kitchen", price: 199.99, stock: 15, status: "Active" },
  { name: "Bluetooth Speaker", category: "Electronics", price: 49.99, stock: 40, status: "Active" },
  { name: "Organic Skincare Set", category: "Beauty", price: 89.99, stock: 25, status: "Active" },
  { name: "Fitness Tracker", category: "Electronics", price: 59.99, stock: 50, status: "Active" },
  { name: "Reusable Shopping Bags", category: "Home & Kitchen", price: 12.99, stock: 200, status: "Active" },
  { name: "Portable Charger", category: "Electronics", price: 34.99, stock: 60, status: "Active" },
  { name: "Bamboo Bed Sheets", category: "Home & Kitchen", price: 79.99, stock: 30, status: "Active" },
  { name: "Noise-Cancelling Headphones", category: "Electronics", price: 199.99, stock: 20, status: "Active" },
  { name: "Organic Coffee Beans", category: "Food & Beverage", price: 14.99, stock: 100, status: "Active" },
  { name: "Smart LED Light Bulbs", category: "Home & Kitchen", price: 39.99, stock: 75, status: "Active" },
]

export default function SellerProductList() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [sortColumn, setSortColumn] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
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
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Product
            </Button>
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
                  <Button variant="ghost" onClick={() => handleSort('name')}>
                    Name <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('price')}>
                    Price <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('stock')}>
                    Stock <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status}
                    </span>
                  </TableCell>
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
                        <DropdownMenuItem>View product</DropdownMenuItem>
                        <DropdownMenuItem>Edit product</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Delete product</DropdownMenuItem>
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
    </div>
  )
}