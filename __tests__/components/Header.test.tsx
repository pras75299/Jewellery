import { render, screen } from "@testing-library/react";
import Header from "@/components/layout/Header";
import { mockUser } from "../helpers/test-helpers";

const mockCheckAuth = jest.fn();
const mockLogout = jest.fn();
const mockGetItemCount = jest.fn(() => 0);

jest.mock("@/lib/store", () => ({
  useCartStore: jest.fn(() => ({
    getItemCount: mockGetItemCount,
  })),
  useAuthStore: jest.fn(() => ({
    user: null,
    checkAuth: mockCheckAuth,
    logout: mockLogout,
  })),
}));

// Mock useAuthStore to return different values
const { useAuthStore, useCartStore } = require("@/lib/store");

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItemCount.mockReturnValue(0);
  });

  it("should render header with logo", () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      checkAuth: mockCheckAuth,
      logout: mockLogout,
    });

    render(<Header />);

    expect(screen.getByText("JEWELLERY")).toBeTruthy();
  });

  it("should show login link when user is not authenticated", () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      checkAuth: mockCheckAuth,
      logout: mockLogout,
    });

    render(<Header />);

    expect(screen.getByText("My Account")).toBeTruthy();
  });

  it("should show user name and logout button when authenticated", () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: mockUser,
      checkAuth: mockCheckAuth,
      logout: mockLogout,
    });

    render(<Header />);

    expect(screen.getByText(/Welcome, Test User/i)).toBeTruthy();
    expect(screen.getByText("Logout")).toBeTruthy();
  });

  it("should display cart icon", () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      checkAuth: mockCheckAuth,
      logout: mockLogout,
    });

    render(<Header />);

    const links = screen.getAllByRole("link");
    const cartLink = links.find(
      (link) => link.getAttribute("href") === "/cart"
    );
    expect(cartLink).toBeTruthy();
  });

  it("should display wishlist icon", () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      checkAuth: mockCheckAuth,
      logout: mockLogout,
    });

    render(<Header />);

    // Wishlist link should be present
    const links = screen.getAllByRole("link");
    const wishlistLink = links.find(
      (link) => link.getAttribute("href") === "/wishlist"
    );
    expect(wishlistLink).toBeTruthy();
  });
});
