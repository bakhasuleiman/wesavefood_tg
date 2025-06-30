import { Octokit } from '@octokit/rest'

// Проверка наличия необходимых переменных окружения
const requiredEnvVars = [
  'GITHUB_TOKEN',
  'GITHUB_OWNER',
  'GITHUB_REPO',
  'GITHUB_BRANCH'
] as const

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

// Конфигурация GitHub
export const config = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  GITHUB_OWNER: process.env.GITHUB_OWNER || 'bakhasuleiman',
  GITHUB_REPO: process.env.GITHUB_REPO || 'wesavefood_tg',
  GITHUB_BRANCH: process.env.GITHUB_BRANCH || 'main',
  dataPath: 'data',
}

// Инициализация Octokit
export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

// Пути к файлам данных
export const DATA_PATHS = {
  users: 'data/users.json',
  stores: 'data/stores.json',
  products: 'data/products.json',
  orders: 'data/orders.json',
  favorites: 'data/favorites.json',
  reviews: 'data/reviews.json',
  notifications: 'data/notifications.json',
} as const

// Типы файлов данных
export type DataFileType = keyof typeof DATA_PATHS

// Время жизни кэша
export const CACHE_TTL = parseInt(process.env.DATABASE_CACHE_TTL || '300000', 10) // 5 минут по умолчанию 