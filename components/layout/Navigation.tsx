"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const categories = [
  {
    name: "Women",
    href: "/shop?category=women",
    subcategories: [
      { name: "Rings", href: "/shop?category=women&subcategory=rings" },
      { name: "Necklaces", href: "/shop?category=women&subcategory=necklaces" },
      { name: "Earrings", href: "/shop?category=women&subcategory=earrings" },
      { name: "Bracelets", href: "/shop?category=women&subcategory=bracelets" },
    ],
  },
  {
    name: "Kids",
    href: "/shop?category=kids",
    subcategories: [
      { name: "Kids Rings", href: "/shop?category=kids&subcategory=rings" },
      { name: "Kids Necklaces", href: "/shop?category=kids&subcategory=necklaces" },
    ],
  },
  {
    name: "Artificial Jewellery",
    href: "/shop?category=artificial",
    subcategories: [
      { name: "Artificial Rings", href: "/shop?category=artificial&subcategory=rings" },
      { name: "Artificial Necklaces", href: "/shop?category=artificial&subcategory=necklaces" },
    ],
  },
  {
    name: "Footwear",
    href: "/shop?category=footwear",
  },
  {
    name: "Accessories",
    href: "/shop?category=accessories",
  },
];

export default function Navigation({ isOpen = false, onClose }: NavigationProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block border-t bg-background">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1">
            {categories.map((category) => (
              <li
                key={category.name}
                className="relative group"
                onMouseEnter={() => setOpenDropdown(category.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={category.href}
                  className="flex items-center gap-1 px-4 py-4 text-sm font-medium hover:text-primary transition-colors"
                >
                  {category.name}
                  {category.subcategories && (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Link>
                {category.subcategories && (
                  <div
                    className={cn(
                      "absolute top-full left-0 bg-popover border rounded-md shadow-lg min-w-[200px] py-2 transition-all",
                      openDropdown === category.name
                        ? "opacity-100 visible"
                        : "opacity-0 invisible pointer-events-none"
                    )}
                  >
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={onClose}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
            <li>
              <Link
                href="/contact"
                className="block px-4 py-4 text-sm font-medium hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {categories.map((category) => (
              <div key={category.name}>
                <Link
                  href={category.href}
                  className="block px-4 py-2 text-sm font-medium hover:text-primary"
                  onClick={onClose}
                >
                  {category.name}
                </Link>
                {category.subcategories && (
                  <div className="pl-4 space-y-1">
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary"
                        onClick={onClose}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/contact"
              className="block px-4 py-2 text-sm font-medium hover:text-primary"
              onClick={onClose}
            >
              Contact
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
