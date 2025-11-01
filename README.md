# Jewellery E-commerce Store

A modern, high-performance e-commerce application built with Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, and Aceternity UI components.

## Features

- 🛍️ **Product Catalog** - Browse and filter products by category, price, and more
- 🛒 **Shopping Cart** - Add, remove, and manage items in your cart
- ❤️ **Wishlist** - Save your favorite products for later
- 👤 **User Accounts** - Create an account and manage your profile
- 💳 **Checkout** - Secure checkout process with multiple payment options
- 📱 **Responsive Design** - Fully responsive design that works on all devices
- 🎨 **Modern UI** - Beautiful, modern interface with smooth animations
- ⚡ **Performance** - Optimized for speed and SEO

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy images to public directory:
```bash
# Images should be in public/img/
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── shop/              # Shop page
│   ├── products/          # Product details
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout page
│   ├── wishlist/          # Wishlist page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── contact/           # Contact page
│   └── account/           # User account page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components (Header, Footer)
│   └── home/             # Home page components
├── lib/                   # Utilities and stores
│   ├── store.ts          # Zustand stores (cart, wishlist)
│   ├── utils.ts          # Utility functions
│   └── data.ts           # Mock product data
└── public/                # Static assets
    └── img/              # Product images
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features in Detail

### Product Pages
- Product listing with filters and sorting
- Product details with image gallery
- Product reviews and ratings
- Related products

### Shopping Experience
- Persistent shopping cart (localStorage)
- Wishlist functionality
- Quick add to cart from product cards
- Cart quantity management

### User Features
- User authentication (login/register)
- User account management
- Order history
- Saved addresses
- Payment methods

### Modern UI Features
- Smooth page transitions
- Hover effects on products
- Animated hero section
- Responsive navigation
- Mobile-friendly design

## Customization

### Colors
Edit the color variables in `app/globals.css` to customize the theme.

### Products
Update the `mockProducts` array in `lib/data.ts` or connect to your API.

### Store Configuration
Modify the Zustand stores in `lib/store.ts` to customize cart and wishlist behavior.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions, please open an issue on GitHub.