"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const userInitial = session?.user?.name?.[0]?.toUpperCase() || "TP";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <header className="h-16 w-full bg-white dark:bg-black border-b px-4 py-3 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>

        <h1 className="text-lg font-semibold text-black dark:text-white">
          TaskPilot
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        {session?.user && (
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            Logout
          </Button>
        )}
        <Avatar className="h-8 w-8">
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
