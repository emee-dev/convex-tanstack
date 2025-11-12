import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { api } from '@/convex_generated/api'
import { getInitials } from '@/lib/utils'
import { useAuthActions } from '@convex-dev/auth/react'
import { useRouter } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { ChevronDownIcon, LogOutIcon } from 'lucide-react'

export function ProfileDropdown() {
  const router = useRouter()
  const { signOut } = useAuthActions()
  const user = useQuery(api.auth.getUserSafe)

  const handleSignOut = async () => {
    await signOut()
    router.invalidate()
  }

  if (!user) return <></>

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto p-0 hover:bg-transparent dark:hover:bg-transparent cursor-pointer border-none"
        >
          <Avatar className="size-8">
            <AvatarImage
              src={(user?.image || '') as string}
              alt="Profile image"
            />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <ChevronDownIcon
            size={16}
            className="opacity-60"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-64">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {user.name}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuItem onClick={() => handleSignOut()}>
          <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
