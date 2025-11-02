"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingCart, Star, Check } from "lucide-react";
import { useCartStore, useWishlistStore, Product } from "@/lib/store";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import ProductCard from "@/components/home/ProductCard";
import Link from "next/link";

export default function ProductPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addItem);
  const addToWishlist = useWishlistStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const resolvedParams = await Promise.resolve(params);
        const productId = resolvedParams.id;

        const productResponse = await fetch(`/api/products/${productId}`);
        const productData = await productResponse.json();

        if (productData.success) {
          setProduct(productData.data);

          // Fetch related products from same category
          const category = productData.data.category || "women";
          const relatedResponse = await fetch(
            `/api/products?category=${category}&limit=5`
          );
          const relatedData = await relatedResponse.json();

          if (relatedData.success) {
            const filtered = relatedData.data.filter(
              (p: Product) => p.id !== productId
            );
            setRelatedProducts(filtered.slice(0, 4));
          }
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="aspect-square bg-muted animate-pulse rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
              <div className="h-12 bg-muted animate-pulse rounded w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const isInWishlist = useWishlistStore((state) =>
    state.isInWishlist(product.id)
  );
  const images = product.images || [product.image];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleAddToWishlist = () => {
    addToWishlist(product);
    toast.success(`${product.name} added to wishlist!`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square relative mb-4 rounded-lg overflow-hidden bg-muted group">
              <Image
                src={images[selectedImage] || product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
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
                    sizes="(max-width: 1024px) 25vw, 12.5vw"
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
                ({(product as any).reviewCount || 0} reviews)
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
              {product.inStock ? (
                <>
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">In Stock</span>
                </>
              ) : (
                <>
                  <span className="h-5 w-5 text-red-600">✕</span>
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
              <span className="text-sm text-muted-foreground">
                SKU: {product.id}
              </span>
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
                    min="1"
                    max={(product as any).stockQuantity || 999}
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      const maxQty = (product as any).stockQuantity || 999;
                      setQuantity(Math.max(1, Math.min(value, maxQty)));
                    }}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const maxQty = (product as any).stockQuantity || 999;
                      setQuantity(Math.min(maxQty, quantity + 1));
                    }}
                  >
                    +
                  </Button>
                </div>
                {(product as any).stockQuantity && (
                  <span className="text-sm text-muted-foreground">
                    (Max: {(product as any).stockQuantity})
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <Button 
                size="lg" 
                className="flex-1" 
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" onClick={handleAddToWishlist}>
                <Heart
                  className={cn(
                    "h-5 w-5",
                    isInWishlist && "fill-primary text-primary"
                  )}
                />
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
                className="flex-1"
                disabled={!product.inStock}
              >
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
                  manufacturing defects. We offer free repairs within the
                  warranty period and lifetime maintenance service.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                {((product as any).reviews && (product as any).reviews.length > 0) ? (
                  <div className="space-y-4">
                    {(product as any).reviews.map((review: any, index: number) => (
                      <div key={review.id || index}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {review.user?.name || "Anonymous"}
                          </span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i < (review.rating || 0)
                                    ? "fill-primary text-primary"
                                    : "text-muted"
                                )}
                              />
                            ))}
                          </div>
                          {review.createdAt && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet. Be the first to review this product!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
