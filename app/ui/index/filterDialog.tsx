 
import { Filter } from 'lucide-react'
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
import { Slider } from "~/components/ui/slider"
import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label"
import { Button } from "~/components/ui/button"
import { useState } from 'react'

export default function FilterDialog() {
    const [priceRange, setPriceRange] = useState([0, 1000])
    const [inStock, setInStock] = useState(false)
return (

    <Dialog>
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
          <Slider
            id="price-range"
            min={0}
            max={1000}
            step={10}
            value={priceRange}
            onValueChange={setPriceRange}
            className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
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
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-low-high">Price: Low to High</SelectItem>
            <SelectItem value="price-high-low">Price: High to Low</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="distance">Distance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end">
        <Button type="submit">Apply Filters</Button>
      </div>
    </DialogContent>
  </Dialog>
)
}