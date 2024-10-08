import { Link } from '@remix-run/react'
import { User, LogOut, ShoppingBag } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { PopoverContent } from '~/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"

interface UserMenuProps {
  user: any;
  onOpenChange: (open: boolean) => void;
}

export function UserMenu({ user, onOpenChange }: UserMenuProps) {
  const handleLinkClick = () => {
    onOpenChange(false);
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <PopoverContent className="w-64 mt-2">
      <div className="grid gap-4">
        {!user ? (
          <>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link to="/register" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Sign up</span>
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link to="/login" className="flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign in</span>
              </Link>
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user.avatarImage} alt={user.username} />
                <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user.username}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
            </div>
            <hr />
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link to="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={handleLinkClick}>
              <Link to="/products" className="flex items-center">
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span>Products</span>
              </Link>
            </Button>
            <hr />
            <Link to={'/logout'} onClick={handleLinkClick}>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </Button>
            </Link>
          </>
        )}
      </div>
    </PopoverContent>
  )
}
