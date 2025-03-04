import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Heart, LogOut, UserCircle } from "lucide-react";
import { PartnerMenu } from "./partner-menu";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b">
      <div className="container h-full flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" className="text-xl font-bold">
            WatchMatch
          </Button>
        </Link>

        {user && (
          <div className="flex gap-2">
            <Link href="/swipe">
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/matches">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <UserCircle className="h-5 w-5" />
              </Button>
            </Link>
            <PartnerMenu />
            <Button variant="ghost" size="icon" onClick={() => logout()}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}