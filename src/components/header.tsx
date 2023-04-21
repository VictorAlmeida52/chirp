import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import {
  BirdIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const UserPopupButton = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <SignInButton>
        <div className="flex cursor-pointer items-center gap-2 rounded-sm bg-foreground px-4 py-2 text-primary-foreground hover:bg-foreground/75">
          <LogInIcon />
          <span>Sign in</span>
        </div>
      </SignInButton>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage
            src={user.profileImageUrl}
            alt={`@${user.username ?? "username not found"}'s profile picture`}
          />
          <AvatarFallback>
            <UserIcon />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-2">
        <DropdownMenuLabel className="cursor-default">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center">
          <HomeIcon className="mr-4 h-4 w-4" />
          <Link href="/">Home</Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center">
          <LogOutIcon className="mr-4 h-4 w-4" />
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 shadow-sm">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex gap-2">
            <BirdIcon />
            <span className="hidden md:block">Chirp</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 sm:space-x-4 md:justify-end">
          <div className="relative flex w-full flex-1 items-center gap-2 md:w-auto md:flex-none">
            <SearchIcon className="absolute right-2" />
            <Input disabled className="pr-10" placeholder="Search..." />
          </div>
          <div className="flex items-center space-x-1">
            <UserPopupButton />
          </div>
        </div>
      </div>
    </header>
  );
};