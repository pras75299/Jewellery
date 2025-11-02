import React from "react";
import { render } from "@testing-library/react";

// Custom render function with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    authStore = { user: null, checkAuth: jest.fn(), logout: jest.fn() },
    cartStore = {
      items: [],
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getTotal: jest.fn(() => 0),
      getItemCount: jest.fn(() => 0),
    },
    wishlistStore = {
      items: [],
      addItem: jest.fn(),
      removeItem: jest.fn(),
      isInWishlist: jest.fn(() => false),
    },
  } = {}
) => {
  // Mock stores before render
  jest.doMock("@/lib/store", () => ({
    useAuthStore: jest.fn(() => authStore),
    useCartStore: jest.fn(() => cartStore),
    useWishlistStore: jest.fn(() => wishlistStore),
  }));

  return render(ui);
};

// Test user data
export const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  phone: "+1234567890",
  role: "USER",
};

export const mockAdminUser = {
  id: "admin-1",
  email: "admin@jewellery.com",
  name: "Admin User",
  phone: "+1234567890",
  role: "ADMIN",
};

// Test product data
export const mockProduct = {
  id: "product-1",
  name: "Test Product",
  slug: "test-product",
  description: "Test description",
  price: 1000,
  originalPrice: 1500,
  image: "/img/product/1.jpg",
  images: ["/img/product/1.jpg"],
  category: "women",
  inStock: true,
  stockQuantity: 10,
  rating: 4.5,
  reviewCount: 10,
};

// Test cart item
export const mockCartItem = {
  ...mockProduct,
  quantity: 2,
};
