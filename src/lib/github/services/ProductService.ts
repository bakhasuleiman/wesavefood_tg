import { Product } from '@/types'
import { database } from '../database'
import { v4 as uuidv4 } from 'uuid'

export class ProductService {
  async getAllProducts(): Promise<Product[]> {
    const products = await database.get('products') || {}
    return Object.values(products)
  }

  async getProductById(id: string): Promise<Product | null> {
    return await database.get(`products/${id}`)
  }

  async getProductsByStore(storeId: string): Promise<Product[]> {
    const products = await database.get('products') || {}
    return Object.values(products).filter((product: Product) => product.storeId === storeId)
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const products = await database.get('products') || {}
    return Object.values(products).filter((product: Product) => product.category === category)
  }

  async getUrgentProducts(): Promise<Product[]> {
    const products = await database.get('products') || {}
    return Object.values(products).filter((product: Product) => product.isUrgent)
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const id = uuidv4()
    const now = new Date().toISOString()
    
    const product: Product = {
      ...productData,
      id,
      createdAt: now,
      updatedAt: now
    }

    await database.set(`products/${id}`, product)
    return product
  }

  async updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product | null> {
    const existingProduct = await database.get(`products/${id}`)
    if (!existingProduct) return null

    const updatedProduct: Product = {
      ...existingProduct,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await database.set(`products/${id}`, updatedProduct)
    return updatedProduct
  }

  async deleteProduct(id: string): Promise<void> {
    await database.delete(`products/${id}`)
  }

  async searchProducts(query: string): Promise<Product[]> {
    const products = await database.get('products') || {}
    const searchLower = query.toLowerCase()
    
    return Object.values(products).filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
    )
  }

  async getProductsByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Promise<Product[]> {
    const products = await database.get('products') || {}
    return Object.values(products).filter(
      product =>
        product.discountedPrice >= minPrice && 
        product.discountedPrice <= maxPrice
    )
  }

  async getProductsByDiscountRange(
    minDiscount: number,
    maxDiscount: number
  ): Promise<Product[]> {
    const products = await database.get('products') || {}
    return Object.values(products).filter(
      product =>
        product.discountPercentage >= minDiscount && 
        product.discountPercentage <= maxDiscount
    )
  }

  async getExpiringSoonProducts(daysThreshold: number = 7): Promise<Product[]> {
    const products = await database.get('products') || {}
    const now = new Date()
    
    return Object.values(products).filter(product => {
      const expiryDate = new Date(product.expiryDate)
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0
    })
  }
} 