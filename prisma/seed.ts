import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Function to generate random password
function generateRandomPassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map((val) => charset[val % charset.length])
    .join('');
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD || generateRandomPassword(20);
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jewellery.com' },
    update: {},
    create: {
      email: 'admin@jewellery.com',
      name: 'Admin User',
      password: hashedPassword,
      phone: '+919876543210',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);
  if (!process.env.ADMIN_PASSWORD) {
    console.log('⚠️  IMPORTANT: Admin password generated, save this:', adminPassword);
    console.log('   Password:', adminPassword);
  }

  // Create test user (only in development)
  if (process.env.NODE_ENV === 'development') {
    const testUserPassword = process.env.TEST_USER_PASSWORD || generateRandomPassword(12);
    const userPassword = await bcrypt.hash(testUserPassword, 10);
    const user = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        name: 'Test User',
        password: userPassword,
        phone: '+919876543211',
        role: 'USER',
      },
    });

    console.log('✅ Test user created:', user.email);
    if (!process.env.TEST_USER_PASSWORD) {
      console.log('⚠️  Test user password:', testUserPassword);
    }
  }

  // Create sample products
  const products = [
    {
      name: 'Beaumont Summit',
      slug: 'beaumont-summit',
      description: 'Elegant jewelry piece with exquisite craftsmanship.',
      price: 3300,
      originalPrice: 4500,
      image: '/img/product/1.jpg',
      images: ['/img/product/1.jpg'],
      category: 'women',
      inStock: true,
      stockQuantity: 50,
      rating: 4.5,
      reviewCount: 12,
    },
    {
      name: 'Classic Gold Ring',
      slug: 'classic-gold-ring',
      description: 'Timeless classic gold ring for special occasions.',
      price: 4000,
      image: '/img/product/2.jpg',
      images: ['/img/product/2.jpg'],
      category: 'women',
      inStock: true,
      stockQuantity: 30,
      rating: 4.0,
      reviewCount: 8,
    },
    {
      name: 'Pearl Necklace',
      slug: 'pearl-necklace',
      description: 'Beautiful pearl necklace that adds elegance to any outfit.',
      price: 3000,
      originalPrice: 4500,
      image: '/img/product/3.jpg',
      images: ['/img/product/3.jpg'],
      category: 'women',
      inStock: true,
      stockQuantity: 25,
      rating: 5.0,
      reviewCount: 15,
    },
    {
      name: 'Diamond Earrings',
      slug: 'diamond-earrings',
      description: 'Stunning diamond earrings that sparkle with every movement.',
      price: 6000,
      image: '/img/product/4.jpg',
      images: ['/img/product/4.jpg'],
      category: 'women',
      inStock: true,
      stockQuantity: 15,
      rating: 4.8,
      reviewCount: 20,
    },
    {
      name: 'Silver Bracelet',
      slug: 'silver-bracelet',
      description: 'Elegant silver bracelet with intricate design.',
      price: 3500,
      originalPrice: 4500,
      image: '/img/product/5.jpg',
      images: ['/img/product/5.jpg'],
      category: 'women',
      inStock: true,
      stockQuantity: 40,
      rating: 4.2,
      reviewCount: 10,
    },
    {
      name: 'Rose Gold Set',
      slug: 'rose-gold-set',
      description: 'Complete rose gold jewelry set for special occasions.',
      price: 4500,
      image: '/img/product/6.jpg',
      images: ['/img/product/6.jpg'],
      category: 'women',
      inStock: true,
      stockQuantity: 20,
      rating: 4.6,
      reviewCount: 18,
    },
    {
      name: 'Art Deco Pendant',
      slug: 'art-deco-pendant',
      description: 'Vintage-inspired art deco pendant with unique design.',
      price: 5500,
      image: '/img/product/7.jpg',
      images: ['/img/product/7.jpg'],
      category: 'women',
      inStock: true,
      stockQuantity: 12,
      rating: 5.0,
      reviewCount: 25,
    },
    {
      name: 'Vintage Brooch',
      slug: 'vintage-brooch',
      description: 'Charming vintage brooch with intricate details.',
      price: 2000,
      originalPrice: 5500,
      image: '/img/product/8.jpg',
      images: ['/img/product/8.jpg'],
      category: 'women',
      inStock: true,
      stockQuantity: 35,
      rating: 4.3,
      reviewCount: 7,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
    console.log(`✅ Product created: ${created.name}`);
  }

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
