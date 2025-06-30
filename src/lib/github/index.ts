export * from './config'
export * from './database'
export * from './initDatabase'
export * from './services/UserService'
export * from './services/ProductService'
export * from './services/StoreService'

// Создаем экземпляры сервисов для удобного использования
import { UserService } from './services/UserService'
import { StoreService } from './services/StoreService'
import { ProductService } from './services/ProductService'

export const userService = new UserService()
export const storeService = new StoreService()
export const productService = new ProductService() 