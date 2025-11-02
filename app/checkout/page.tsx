"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { useCartStore, useAuthStore } from "@/lib/store";
import { toast } from "sonner";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const { user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    pincode: "",
    notes: "",
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch("/api/addresses");
        const data = await response.json();
        if (data.success && data.data) {
          setAddresses(data.data);
          // Select default address if available
          const defaultAddress = data.data.find((addr: Address) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          } else if (data.data.length > 0) {
            setSelectedAddressId(data.data[0].id);
          } else {
            setShowAddressForm(true);
          }
        } else {
          setShowAddressForm(true);
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
        setShowAddressForm(true);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, []);

  // Update form data when user info is available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const subtotal = getTotal();
  const shipping = subtotal > 499 ? 0 : 50;
  const gst = subtotal * 0.18; // 18% GST (matches API)
  const total = subtotal + shipping + gst;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleAddAddress = async () => {
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const addressResponse = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          addressLine1: formData.address,
          city: formData.city,
          postalCode: formData.pincode,
          state: formData.city,
          country: "India",
          isDefault: addresses.length === 0, // Set as default if no addresses exist
        }),
      });

      const addressData = await addressResponse.json();

      if (!addressResponse.ok || !addressData.success) {
        throw new Error(addressData.error || "Failed to create address");
      }

      // Add to addresses list and select it
      setAddresses([...addresses, addressData.data]);
      setSelectedAddressId(addressData.data.id);
      setShowAddressForm(false);
      
      // Clear form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        pincode: "",
        notes: formData.notes, // Keep notes
      });

      toast.success("Address added successfully!");
    } catch (error: any) {
      console.error("Add address error:", error);
      toast.error(error.message || "Failed to add address. Please try again.");
    }
  };

  const handlePlaceOrder = async () => {
    // Validate address selection
    if (!selectedAddressId && !showAddressForm) {
      toast.error("Please select or add an address");
      return;
    }

    // If showing form, validate it
    if (showAddressForm) {
      if (!formData.firstName || !formData.lastName || !formData.email || 
          !formData.phone || !formData.address || !formData.city || !formData.pincode) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

    setLoading(true);

    try {
      // First, clear database cart to avoid duplicates
      await fetch("/api/cart", {
        method: "DELETE",
      });

      // Then, sync all cart items to database with exact quantities
      const syncPromises = items.map((item) =>
        fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: item.id,
            quantity: item.quantity,
          }),
        })
      );

      await Promise.all(syncPromises);

      let addressId = selectedAddressId;

      // If no address selected, create new one
      if (!addressId && showAddressForm) {
        const addressResponse = await fetch("/api/addresses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            addressLine1: formData.address,
            city: formData.city,
            postalCode: formData.pincode,
            state: formData.city,
            country: "India",
            isDefault: addresses.length === 0,
          }),
        });

        const addressData = await addressResponse.json();

        if (!addressResponse.ok || !addressData.success) {
          throw new Error(addressData.error || "Failed to create address");
        }

        addressId = addressData.data.id;
      }

      if (!addressId) {
        throw new Error("No address selected");
      }

      // Then, create order
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addressId: addressId,
          paymentMethod: paymentMethod,
          notes: formData.notes || undefined,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to place order");
      }

      // Success!
      clearCart();
      toast.success("Order placed successfully!");
      router.push("/account?tab=orders");
    } catch (error: any) {
      console.error("Place order error:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <p className="text-xl mb-4">Your cart is empty</p>
          <Button asChild>
            <a href="/shop">Continue Shopping</a>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Billing Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingAddresses ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                ) : addresses.length > 0 && !showAddressForm ? (
                  <>
                    <div className="space-y-3">
                      <Label>Select Address</Label>
                      <RadioGroup
                        value={selectedAddressId}
                        onValueChange={setSelectedAddressId}
                      >
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                              selectedAddressId === address.id
                                ? "border-primary bg-primary/5"
                                : "border-muted"
                            }`}
                            onClick={() => setSelectedAddressId(address.id)}
                          >
                            <RadioGroupItem
                              value={address.id}
                              id={address.id}
                              className="mt-1"
                            />
                            <Label
                              htmlFor={address.id}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">
                                    {address.fullName}
                                  </span>
                                  {address.isDefault && (
                                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {address.addressLine1}
                                  {address.addressLine2 && `, ${address.addressLine2}`}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {address.city}, {address.state} - {address.postalCode}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {address.country}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Phone: {address.phone}
                                </p>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowAddressForm(true)}
                    >
                      + Add New Address
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input 
                          id="firstName" 
                          value={formData.firstName}
                          onChange={handleChange}
                          required 
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input 
                          id="lastName" 
                          value={formData.lastName}
                          onChange={handleChange}
                          required 
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        type="email" 
                        id="email" 
                        value={formData.email}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input 
                        type="tel" 
                        id="phone" 
                        value={formData.phone}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input 
                        id="address" 
                        value={formData.address}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input 
                          id="city" 
                          value={formData.city}
                          onChange={handleChange}
                          required 
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input 
                          id="pincode" 
                          value={formData.pincode}
                          onChange={handleChange}
                          required 
                        />
                      </div>
                    </div>
                    {addresses.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          setShowAddressForm(false);
                          setFormData({
                            firstName: "",
                            lastName: "",
                            email: "",
                            phone: "",
                            address: "",
                            city: "",
                            pincode: "",
                            notes: formData.notes,
                          });
                        }}
                      >
                        ← Use Saved Address
                      </Button>
                    )}
                    {showAddressForm && addresses.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleAddAddress}
                      >
                        Save Address
                      </Button>
                    )}
                  </>
                )}
                <div className="pt-4 border-t">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Input 
                    id="notes" 
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Special instructions for delivery"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="cursor-pointer">
                      Cash on Delivery
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="cursor-pointer">
                      Credit/Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="cursor-pointer">
                      UPI
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Your Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
