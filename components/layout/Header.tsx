"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Heart, ShoppingCart, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "./Navigation";
import { useCartStore, useAuthStore } from "@/lib/store";

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const { user, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    // Check auth once on mount (checkAuth has internal guards against duplicate calls)
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="hidden md:block border-b bg-muted/40">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center text-sm">
            <p className="text-muted-foreground">
              FREE SHIPPING ON ORDERS OVER ₹499
            </p>
            <div className="flex items-center gap-4">
              {/* <Link href="/services/design" className="text-muted-foreground hover:text-primary">
                Design Service
              </Link>
              <Link href="/services/repair" className="text-muted-foreground hover:text-primary">
                Repair Service
              </Link> */}
              {user ? (
                <>
                  <span className="text-muted-foreground">
                    Welcome, {user.name || user.email}
                  </span>
                  <Link
                    href="/account"
                    className="text-muted-foreground hover:text-primary"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-primary"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-muted-foreground hover:text-primary"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/register"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="text-2xl font-bold text-primary">JEWELLERY</div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search products..."
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search />
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link href={user ? "/account" : "/login"}>
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <Navigation isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
}
