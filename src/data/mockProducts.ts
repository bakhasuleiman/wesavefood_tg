import { Product, User } from '@/types'

export const mockStores: User[] = [
  {
    id: 'store1',
    name: 'Продуктовый магазин "У дома"',
    username: 'localstore',
    type: 'store',
    storeId: 'store1',
    avatar: 'https://example.com/store1.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'store2',
    name: 'Супермаркет "Экономный"',
    username: 'ecosupermarket',
    type: 'store',
    storeId: 'store2',
    avatar: 'https://example.com/store2.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export const mockProducts: Product[] = [
  {
    id: 'product1',
    title: 'Хлеб белый',
    description: 'Свежий белый хлеб',
    price: 30,
    oldPrice: 40,
    quantity: 5,
    unit: 'шт',
    category: 'Хлебобулочные изделия',
    images: ['https://example.com/bread1.jpg'],
    storeId: 'store1',
    storeName: 'Продуктовый магазин "У дома"',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'product2',
    title: 'Молоко',
    description: 'Свежее молоко 3.2%',
    price: 65,
    oldPrice: 80,
    quantity: 10,
    unit: 'л',
    category: 'Молочные продукты',
    images: ['https://example.com/milk1.jpg'],
    storeId: 'store2',
    storeName: 'Супермаркет "Экономный"',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
] 