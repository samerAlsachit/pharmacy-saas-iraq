import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const products = [
  {
    barcode: '6281001001001',
    nameAr: 'بانادول أقراص',
    nameEn: 'Panadol Tablets',
    category: 'مسكنات',
    stockQty: 100,
    minThreshold: 20,
    expiryDate: new Date('2027-12-31'),
    purchasePrice: 2500,
    sellPrice: 3500,
    isControlled: false,
    supplier: 'شركة الإسكندرية',
  },
  {
    barcode: '6281002002002',
    nameAr: 'أموكسيسيلين كبسول',
    nameEn: 'Amoxicillin Capsules',
    category: 'مضادات حيوية',
    stockQty: 50,
    minThreshold: 15,
    expiryDate: new Date('2027-06-30'),
    purchasePrice: 4500,
    sellPrice: 6000,
    isControlled: false,
    supplier: 'جلانزا',
  },
  {
    barcode: '6281003003003',
    nameAr: 'فنتولين بخاخ',
    nameEn: 'Ventolin Inhaler',
    category: 'جهاز تنفسي',
    stockQty: 30,
    minThreshold: 10,
    expiryDate: new Date('2027-09-15'),
    purchasePrice: 12000,
    sellPrice: 17500,
    isControlled: false,
    supplier: 'جلاكسو سميث كلاين',
  },
  {
    barcode: '6281004004004',
    nameAr: 'ترامادول 50 مجم',
    nameEn: 'Tramadol 50mg',
    category: 'مسكنات',
    stockQty: 25,
    minThreshold: 10,
    expiryDate: new Date('2027-08-01'),
    purchasePrice: 8000,
    sellPrice: 12000,
    isControlled: true,
    supplier: 'الحكمة',
  },
  {
    barcode: '6281005005005',
    nameAr: 'أوميبرازول كبسول',
    nameEn: 'Omeprazole Capsules',
    category: 'جهاز هضمي',
    stockQty: 80,
    minThreshold: 20,
    expiryDate: new Date('2028-01-01'),
    purchasePrice: 3000,
    sellPrice: 4500,
    isControlled: false,
    supplier: 'الحكمة',
  },
  {
    barcode: '6281006006006',
    nameAr: 'سيتريزين أقراص',
    nameEn: 'Cetirizine Tablets',
    category: 'حساسية',
    stockQty: 60,
    minThreshold: 15,
    expiryDate: new Date('2027-11-30'),
    purchasePrice: 2000,
    sellPrice: 3000,
    isControlled: false,
    supplier: 'الإسكندرية',
  },
  {
    barcode: '6281007007007',
    nameAr: 'ميتفورمين 500 مجم',
    nameEn: 'Metformin 500mg',
    category: 'سكري',
    stockQty: 120,
    minThreshold: 30,
    expiryDate: new Date('2027-10-15'),
    purchasePrice: 1500,
    sellPrice: 2500,
    isControlled: false,
    supplier: 'سانوفي',
  },
  {
    barcode: '6281008008008',
    nameAr: 'لوريستا أقراص',
    nameEn: 'Lorista Tablets',
    category: 'ضغط دم',
    stockQty: 45,
    minThreshold: 10,
    expiryDate: new Date('2027-07-20'),
    purchasePrice: 5500,
    sellPrice: 8000,
    isControlled: false,
    supplier: 'الحكمة',
  },
  {
    barcode: '6281009009009',
    nameAr: 'نوروفين شراب',
    nameEn: 'Nurofen Syrup',
    category: 'مسكنات',
    stockQty: 35,
    minThreshold: 10,
    expiryDate: new Date('2027-05-15'),
    purchasePrice: 4000,
    sellPrice: 6000,
    isControlled: false,
    supplier: 'ريكيت بينكيزر',
  },
  {
    barcode: '6281010010010',
    nameAr: 'ديازيبام 5 مجم',
    nameEn: 'Diazepam 5mg',
    category: 'أعصاب',
    stockQty: 20,
    minThreshold: 5,
    expiryDate: new Date('2027-04-01'),
    purchasePrice: 6000,
    sellPrice: 9000,
    isControlled: true,
    supplier: 'جلانزا',
  },
];

async function main() {
  console.log('Seeding database...');

  for (const product of products) {
    await prisma.product.upsert({
      where: { barcode: product.barcode },
      update: {},
      create: product,
    });
  }

  const count = await prisma.product.count();
  console.log(`Seeded ${count} products`);

  const owner = await prisma.user.upsert({
    where: { username: 'owner' },
    update: {},
    create: {
      username: 'owner',
      displayName: 'المالك',
      password: hashPassword('admin123'),
      role: 'OWNER',
    },
  });

  const assistant = await prisma.user.upsert({
    where: { username: 'assistant' },
    update: {},
    create: {
      username: 'assistant',
      displayName: 'الكاشير',
      password: hashPassword('1234'),
      role: 'ASSISTANT',
    },
  });

  // Update existing users without password
  await prisma.user.updateMany({
    where: { password: undefined },
    data: { password: hashPassword('admin123') },
  });

  console.log(`Created users: ${owner.username} (${owner.role}), ${assistant.username} (${assistant.role})`);
}

main()
  .then(() => {
    console.log('Seed complete');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
