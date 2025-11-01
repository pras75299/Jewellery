"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart, Heart } from "lucide-react";
import { useWishlistStore, useCartStore } from "@/lib/store";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const addToCart = useCartStore((state) => state.addItem);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-4">
              Your wishlist is empty
            </p>
            <Button asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="group">
                <div className="relative aspect-square overflow-hidden bg-muted rounded-t-lg">
                  <Link href={`/products/${item.id}`}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </Link>
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-background/90 backdrop-blur-sm"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <Link href={`/products/${item.id}`}>
                    <h3 className="font-semibold mb-2 hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-lg font-bold">₹{item.price}</span>
                    {item.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{item.originalPrice}
                      </span>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      addToCart(item);
                      removeItem(item.id);
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
