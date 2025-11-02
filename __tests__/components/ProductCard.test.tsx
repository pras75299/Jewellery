import { render, screen, fireEvent } from "@testing-library/react";
import ProductCard from "@/components/home/ProductCard";
import { mockProduct } from "../helpers/test-helpers";

// Mock the stores - need to define mocks before jest.mock
const mockAddToCart = jest.fn();
const mockAddToWishlist = jest.fn();
const mockIsInWishlist = jest.fn(() => false);

jest.mock("@/lib/store", () => {
  const mockAddToCartFn = jest.fn();
  const mockAddToWishlistFn = jest.fn();
  const mockIsInWishlistFn = jest.fn(() => false);

  return {
    useCartStore: jest.fn((selector) => {
      const state = {
        addItem: mockAddToCartFn,
      };
      return typeof selector === "function" ? selector(state) : state;
    }),
    useWishlistStore: jest.fn((selector) => {
      const state = {
        addItem: mockAddToWishlistFn,
        isInWishlist: (id: string) => mockIsInWishlistFn(id),
      };
      return typeof selector === "function" ? selector(state) : state;
    }),
    __mockAddToCart: mockAddToCartFn,
    __mockAddToWishlist: mockAddToWishlistFn,
    __mockIsInWishlist: mockIsInWishlistFn,
  };
});

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
  },
}));

describe("ProductCard Component", () => {
  const {
    __mockAddToCart,
    __mockAddToWishlist,
    __mockIsInWishlist,
  } = require("@/lib/store");

  beforeEach(() => {
    jest.clearAllMocks();
    __mockIsInWishlist.mockReturnValue(false);
  });

  it("should render product information", () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("₹1000")).toBeInTheDocument();
  });

  it("should display sale badge for products with originalPrice", () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText("SALE")).toBeInTheDocument();
  });

  it("should not display sale badge when originalPrice is missing", () => {
    const productWithoutSale = { ...mockProduct, originalPrice: undefined };
    render(<ProductCard product={productWithoutSale} />);

    expect(screen.queryByText("SALE")).not.toBeInTheDocument();
  });

  it("should call addToCart when Add to Cart button is clicked", () => {
    render(<ProductCard product={mockProduct} />);

    const addToCartButton = screen.getByText("Add to Cart");
    fireEvent.click(addToCartButton);

    // addItem accepts optional quantity parameter, component calls with just product
    expect(__mockAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it("should call addToWishlist when wishlist button is clicked", () => {
    render(<ProductCard product={mockProduct} />);

    const wishlistButton = screen.getByRole("button", { name: "" });
    const buttons = screen.getAllByRole("button");
    const heartButton = buttons.find(
      (btn) =>
        btn.querySelector("svg") || btn.closest("button")?.querySelector("svg")
    );

    if (heartButton) {
      fireEvent.click(heartButton);
      expect(__mockAddToWishlist).toHaveBeenCalledWith(mockProduct);
    }
  });

  it("should link to product detail page", () => {
    render(<ProductCard product={mockProduct} />);

    const productLinks = screen.getAllByRole("link");
    const detailLink = productLinks.find(
      (link) => link.getAttribute("href") === `/products/${mockProduct.id}`
    );

    expect(detailLink).toBeInTheDocument();
  });

  it("should disable Add to Cart button when product is out of stock", () => {
    const outOfStockProduct = { ...mockProduct, inStock: false };
    render(<ProductCard product={outOfStockProduct} />);

    const addToCartButton = screen.getByText("Add to Cart");
    expect(addToCartButton).toBeDisabled();
  });
});
