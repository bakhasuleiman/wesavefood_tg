import { GitHubDatabase } from './database'
import { mockProducts } from '@/src/data/mockProducts'
import { User, Store, Product } from '@/types'

const db = GitHubDatabase.getInstance()

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
export async function initializeDatabase() {
  try {
    // Сохраняем пользователей
    console.log('Инициализация пользователей...')
    await db.saveData('users', mockUsers)

    // Сохраняем магазины
    console.log('Инициализация магазинов...')
    await db.saveData('stores', mockStores)

    // Сохраняем товары
    console.log('Инициализация товаров...')
    await db.saveData('products', mockProducts)

    console.log('База данных успешно инициализирована!')
    return true
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error)
    return false
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