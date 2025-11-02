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

- Node.js 18+ and npm/yarn, OR
- Docker and Docker Compose

### Option 1: Running with Docker (Recommended)

Docker is the easiest way to run the application locally with PostgreSQL.

#### Quick Start with Docker Compose

1. **Run the entire application (PostgreSQL + Next.js):**
```bash
# Development mode (with hot reload)
docker-compose -f docker-compose.dev.yml up

# Production mode
docker-compose up
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will:
- Automatically start PostgreSQL
- Run database migrations
- Seed the database (dev mode only)
- Start the Next.js server

#### Running PostgreSQL Only with Docker

If you want to run only PostgreSQL with Docker and run the Next.js app locally:

```bash
# Start PostgreSQL container
docker run --name jewellery_postgres \
  -e POSTGRES_USER=jewellery_user \
  -e POSTGRES_PASSWORD=jewellery_password \
  -e POSTGRES_DB=jewellery_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

Or using Docker Compose:
```bash
# Start only PostgreSQL service
docker-compose up postgres -d
```

Then set your `DATABASE_URL` environment variable:
```bash
export DATABASE_URL="postgresql://jewellery_user:jewellery_password@localhost:5432/jewellery_db?schema=public"
```

#### Other PostgreSQL Options

**Using Homebrew (macOS):**
```bash
brew install postgresql@16
brew services start postgresql@16
createdb jewellery_db
```

**Using apt (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb jewellery_db
```

**Using PostgreSQL official installer:**
Download from [postgresql.org](https://www.postgresql.org/download/) and follow installation instructions for your OS.

### Option 2: Manual Installation (Without Docker)

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp env.example .env
# Edit .env and set your DATABASE_URL and JWT_SECRET
```

3. **Set up the database:**
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed
```

4. **Copy images to public directory:**
```bash
# Images should be in public/img/
```

5. **Run the development server:**
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database

## Docker Configuration

### Environment Variables

For production deployments, make sure to update the following in `docker-compose.yml`:

- `JWT_SECRET`: Change to a strong random secret (minimum 32 characters)
- `DATABASE_URL`: Update if using different database credentials
- `NODE_ENV`: Set to `production` for production deployments

You can also create a `.env` file in the project root and docker-compose will automatically load it:

```bash
# .env
JWT_SECRET=your-production-secret-here
DATABASE_URL=postgresql://user:password@postgres:5432/jewellery_db?schema=public
NODE_ENV=production
```

## Docker Commands

### Development Mode

```bash
# Start services in development mode
docker-compose -f docker-compose.dev.yml up

# Start in background (detached mode)
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build
```

### Production Mode

```bash
# Build and start services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Database Only

```bash
# Start only PostgreSQL
docker-compose up postgres -d

# Stop PostgreSQL
docker-compose stop postgres

# Remove PostgreSQL container and volume
docker-compose down postgres -v
```

### Cleanup

```bash
# Remove all containers, networks, and volumes
docker-compose -f docker-compose.dev.yml down -v
docker-compose down -v

# Remove unused Docker resources
docker system prune -a
```

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