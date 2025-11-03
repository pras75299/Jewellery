"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/home/ProductCard";
import { Product } from "@/lib/store";
import { dedupedFetch } from "@/lib/fetch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
    if (query) {
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setProducts([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const data = await dedupedFetch<{
        success: boolean;
        data: Product[];
      }>(`/api/products?search=${encodeURIComponent(query)}&limit=50`);

      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      performSearch(searchQuery.trim());
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setProducts([]);
    setHasSearched(false);
    router.push("/search");
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Products</h1>
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search for jewelry, rings, necklaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-20 text-lg h-12"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button type="submit" size="icon" className="h-8 w-8">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Searching products...</p>
          </div>
        )}

        {!loading && hasSearched && (
          <>
            {products.length > 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-muted-foreground">
                    Found {products.length} product{products.length !== 1 ? "s" : ""} for "
                    {searchQuery}"
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No products found</h2>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any products matching "{searchQuery}"
                </p>
                <Button onClick={() => router.push("/shop")} variant="outline">
                  Browse All Products
                </Button>
              </div>
            )}
          </>
        )}

        {!loading && !hasSearched && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Search for products</h2>
            <p className="text-muted-foreground">
              Enter keywords to search for jewelry, rings, necklaces, and more
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

