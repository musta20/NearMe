
import { Link } from '@remix-run/react'
import { User, LogOut, Settings, HelpCircle } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { PopoverContent } from '~/components/ui/popover'

 

export function UserMenu({user}) {
  //console.log(user)
  return (
    <PopoverContent className="w-56 mt-2">
      <div className="grid gap-4">
        {!user  ? (
          <>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/register" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Sign up</span>
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/login" className="flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign in</span>
              </Link>
            </Button>
          </>
        ) : (
          <>
            <div>
              <div className="font-medium">{user.username}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
            <hr />
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/products" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Products</span>
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/help" className="flex items-center">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help</span>
              </Link>
            </Button>
            <hr />
                          <Link to={'/logout'}>

             <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
             // onClick={() => signOut({ callbackUrl: '/' })}
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
