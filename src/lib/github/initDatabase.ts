import { database } from './database'
import { mockProducts, mockStores } from '@/src/data/mockProducts'
import { User, Store, Product } from '@/types'

const db = database.getInstance()

// Тестовые пользователи
const mockUsers: User[] = [
  {
    id: '1',
    phone: '+998 90 123 45 67',
    name: 'Тестовый Пользователь',
    profileType: 'client',
    preferences: {
      categories: ['dairy', 'fruits'],
      maxDistance: 5,
      notifications: true
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    phone: '+998 90 987 65 43',
    name: 'Магазин Тестовый',
    profileType: 'store',
    preferences: {
      categories: ['all'],
      maxDistance: 10,
      notifications: true
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

// Тестовые магазины (извлекаем уникальные магазины из mockProducts)
const mockStores: Store[] = Array.from(
  new Set(mockProducts.map(product => product.store.id))
).map(storeId => {
  const product = mockProducts.find(p => p.store.id === storeId)
  return product!.store
})

/**
 * Инициализация базы данных тестовыми данными
 */
export async function initDatabase() {
  try {
    // Создаем базовые структуры данных
    const structures = ['users', 'products', 'stores']
    
    for (const structure of structures) {
      const data = await database.get(structure)
      if (!data) {
        await database.set(structure, {})
      }
    }

    // Инициализируем магазины
    for (const store of mockStores) {
      await database.set(`stores/${store.id}`, store)
    }

    // Инициализируем продукты
    for (const product of mockProducts) {
      await database.set(`products/${product.id}`, product)
    }

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}

/**
 * Проверка существования данных
 */
export async function checkDatabaseExists(): Promise<boolean> {
  try {
    const users = await db.getData<User>('users')
    const stores = await db.getData<Store>('stores')
    const products = await db.getData<Product>('products')

    return users.length > 0 && stores.length > 0 && products.length > 0
  } catch (error) {
    return false
  }
} 