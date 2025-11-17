"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { LogOut, Calendar } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface UserAvatarProps {
  size?: string;
  userAvatar: string;
  userName: string;
  initials: string;
}

function UserAvatar({ size = "h-10 w-10", userAvatar, userName, initials }: UserAvatarProps) {
  return (
    <Avatar className={size}>
      <AvatarImage src={userAvatar} alt={userName} />
      <AvatarFallback className="bg-gradient-to-br from-macaron-lavender to-macaron-mint text-white font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export function ProfileMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!user) {
    return null;
  }

  const userName = user.fullName || user.firstName || user.emailAddresses?.[0]?.emailAddress || "User";
  const userEmail = user.primaryEmailAddress?.emailAddress || "";
  const userAvatar = user.imageUrl || "";

  // Safely compute initials with proper fallbacks
  const nameParts = userName.trim().split(/\s+/).filter(Boolean);
  const initials = nameParts.length > 0 && nameParts[0]
    ? nameParts.map(part => part[0]).join('').toUpperCase().slice(0, 2)
    : (userEmail[0]?.toUpperCase() || "U");

  // Format the date joined using user's preferred locale
  const dateJoined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : "N/A";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-macaron-lavender transition-all"
          aria-label={`Open profile menu for ${userName || 'user'}`}
          aria-haspopup="true"
        >
          <UserAvatar
            userAvatar={userAvatar}
            userName={userName}
            initials={initials}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 p-2">
            <UserAvatar
              size="h-12 w-12"
              userAvatar={userAvatar}
              userName={userName}
              initials={initials}
            />
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined {dateJoined}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
