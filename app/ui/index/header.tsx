
import { Search, User } from 'lucide-react'
import { UserMenu } from "./UserMenu"
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Popover, PopoverTrigger } from '~/components/ui/popover'

export default  function Header(){

  return (
    <header className="p-4 bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold text-red-500">nearbyProducts</h1>
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search for products..."
              className="pl-10 pr-4 py-2 w-full rounded-full border-2 border-gray-200 focus:border-gray-300 focus:ring-0"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-gray-600 hover:bg-gray-100 rounded-full">
            Become a seller
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="text-gray-600 hover:bg-gray-100 rounded-full p-2">
                <User size={24} />
              </Button>
            </PopoverTrigger>
            <UserMenu />
          </Popover>
        </div>
      </div>
    </header>
  )
}