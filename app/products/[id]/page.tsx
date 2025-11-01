"use client";

import { useState } from "react";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingCart, Star, Check } from "lucide-react";
import { mockProducts } from "@/lib/data";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = mockProducts.find((p) => p.id === params.id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addItem);
  const addToWishlist = useWishlistStore((state) => state.addItem);
  const isInWishlist = useWishlistStore((state) =>
    state.isInWishlist(product?.id || "")
  );

  if (!product) {
    notFound();
  }

  const images = product.images || [product.image];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square relative mb-4 rounded-lg overflow-hidden bg-muted">
              <Image
                src={images[selectedImage] || product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "aspect-square relative rounded-lg overflow-hidden border-2 transition-all",
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent hover:border-muted"
                  )}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.floor(product.rating || 0)
                        ? "fill-primary text-primary"
                        : "text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.rating || 0} reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-3xl font-bold">₹{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-sm bg-destructive text-destructive-foreground px-2 py-1 rounded">
                    SALE
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 mb-6">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-green-600 font-medium">In Stock</span>
              <span className="text-sm text-muted-foreground">SKU: {product.id}</span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <Button
                size="lg"
                className="flex-1"
                onClick={() => addToCart(product, quantity)}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => addToWishlist(product)}
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    isInWishlist && "fill-primary text-primary"
                  )}
                />
              </Button>
              <Button size="lg" variant="secondary" className="flex-1">
                Buy Now
              </Button>
            </div>

            <p className="text-muted-foreground">{product.description}</p>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="details" className="mb-12">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="warranty">Warranty</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">
                  {product.description ||
                    "This exquisite jewelry piece features fine craftsmanship and premium materials."}
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Premium quality materials</li>
                  <li>Handcrafted with precision</li>
                  <li>Elegant and timeless design</li>
                  <li>Perfect for special occasions</li>
                  <li>Comes with certificate of authenticity</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="properties" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Material:</span> Gold/Silver
                  </div>
                  <div>
                    <span className="font-medium">Weight:</span> Custom
                  </div>
                  <div>
                    <span className="font-medium">Style:</span> Classic
                  </div>
                  <div>
                    <span className="font-medium">Finish:</span> Polished
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="warranty" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <p>
                  All our jewelry comes with a comprehensive warranty covering
                  manufacturing defects. We offer free repairs within the warranty
                  period and lifetime maintenance service.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">John Doe</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < 4 ? "fill-primary text-primary" : "text-muted"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Great quality product! Exceeded my expectations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
