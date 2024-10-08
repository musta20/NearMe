import { Filter, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from "@remix-run/react"

export default function FilterDialog() {
    const [open, setOpen] = useState(false)
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")
    const [inStock, setInStock] = useState(searchParams.get("inStock") === "true")
    const [orderBy, setOrderBy] = useState(searchParams.get("orderBy") || "")

    const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setMinPrice(e.target.value)
    }

    const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setMaxPrice(e.target.value)
    }

    const handleApplyFilter = () => {
      const params = new URLSearchParams(searchParams)
      if (minPrice) params.set("minPrice", minPrice)
      if (maxPrice) params.set("maxPrice", maxPrice)
      params.set("inStock", inStock.toString())
      if (orderBy) params.set("orderBy", orderBy)

      navigate(`/?${params.toString()}`)
      setOpen(false)
    }

    const handleClearFilters = () => {
      setMinPrice("")
      setMaxPrice("")
      setInStock(false)
      setOrderBy("")
      navigate("/")
    }

    const isFiltersApplied = searchParams.toString() !== ""

    return (
      <div className="flex space-x-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap flex items-center">
              <Filter size={16} className="mr-2" />
              Filters
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Filter Options</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="price-range">Price Range</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    id="min-price"
                    placeholder="Min"
                    value={minPrice}
                    onChange={handleMinPriceChange}
                    className="w-full"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    id="max-price"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={handleMaxPriceChange}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="in-stock"
                  checked={inStock}
                  onCheckedChange={setInStock}
                />
                <Label htmlFor="in-stock">In Stock Only</Label>
              </div>
              <Select value={orderBy} onValueChange={setOrderBy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Order By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="date_desc">Newest First</SelectItem>
                  <SelectItem value="date_asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleApplyFilter}>Apply Filters</Button>
            </div>
          </DialogContent>
        </Dialog>
        {isFiltersApplied && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full whitespace-nowrap flex items-center"
            onClick={handleClearFilters}
          >
            <X size={16} className="mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    )
}