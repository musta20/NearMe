
import { Link } from '@remix-run/react'
import { User, LogOut, Settings, HelpCircle } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { PopoverContent } from '~/components/ui/popover'

 

export function UserMenu() {
  return (
    <PopoverContent className="w-56 mt-2">
      <div className="grid gap-4">
        {true  ? (
          <>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/auth/register" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Sign up</span>
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/auth/signin" className="flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign in</span>
              </Link>
            </Button>
          </>
        ) : (
          <>
            <div>
              <div className="font-medium">musta</div>
              <div className="text-sm text-gray-500">musta@gmail.com</div>
            </div>
            <hr />
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/help" className="flex items-center">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help</span>
              </Link>
            </Button>
            <hr />
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
             // onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </Button>
          </>
        )}
      </div>
    </PopoverContent>
  )
}