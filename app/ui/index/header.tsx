import { Search, User } from 'lucide-react'
import { UserMenu } from "./UserMenu"
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Popover, PopoverTrigger } from '~/components/ui/popover'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from "@remix-run/react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"

export default function Header({user}) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (searchTerm) {
      params.set("search", searchTerm)
    } else {
      params.delete("search")
    }
    navigate(`/?${params.toString()}`)
  }

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="p-4 bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold text-red-500">
          <Link to={"/"}>
          nearbyProducts</Link>
        </h1>
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search for products..."
              className="pl-10 pr-4 py-2 w-full rounded-full border-2 border-gray-200 focus:border-gray-300 focus:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="ghost" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Search className="text-gray-400" size={20} />
            </Button>
          </div>
        </form>
        <div className="flex items-center space-x-4">
          {!user &&
          <Button variant="ghost" className="text-gray-600 hover:bg-gray-100 rounded-full">
            Become a seller
          </Button>
          }
          <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="text-gray-600 hover:bg-gray-100 rounded-full p-2">
                <Avatar>
                  <AvatarImage src={user?.avatarImage} alt={user?.username} />
                  <AvatarFallback>{user ? getInitials(user.username) : <User size={24} />}</AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <UserMenu user={user} onOpenChange={setIsUserMenuOpen} />
          </Popover>
        </div>
      </div>
    </header>
  )
}
