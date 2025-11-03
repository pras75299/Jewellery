"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/store";
import { useCartStore } from "@/lib/store";
import { useWishlistStore } from "@/lib/store";

export function CartWishlistSync() {
  const user = useAuthStore((state) => state.user);
  const syncCart = useCartStore((state) => state.syncFromBackend);
  const syncWishlist = useWishlistStore((state) => state.syncFromBackend);
  const hasSyncedRef = useRef<string | null>(null);
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Sync cart and wishlist when user logs in
    // Only sync if user changed (not just reference change) - fixes Issue #7
    if (user && hasSyncedRef.current !== user.id && prevUserIdRef.current !== user.id) {
      hasSyncedRef.current = user.id;
      prevUserIdRef.current = user.id;
      // Sync both in parallel but await them to prevent race conditions
      Promise.all([syncCart(), syncWishlist()]).catch((error) => {
        console.error('Failed to sync cart/wishlist:', error);
      });
    } else if (!user) {
      // Reset when user logs out
      hasSyncedRef.current = null;
      prevUserIdRef.current = null;
    }
  }, [user?.id]); // Only depend on user.id, not functions or full user object

  return null; // This component doesn't render anything
}

