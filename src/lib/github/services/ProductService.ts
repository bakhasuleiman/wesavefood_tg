import { Product } from '@/types'
import { GitHubDatabase } from '../database'

export class ProductService {
  private db = GitHubDatabase.getInstance()

  async getAllProducts(): Promise<Product[]> {
    return this.db.getData<Product>('products')
  }

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.db.getData<Product>('products')
    return products.find(product => product.id === id) || null
  }

  async getProductsByStore(storeId: string): Promise<Product[]> {
    const products = await this.db.getData<Product>('products')
    return products.filter(product => product.store.id === storeId)
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const products = await this.db.getData<Product>('products')
    return products.filter(product => product.category === category)
  }

  async getUrgentProducts(): Promise<Product[]> {
    const products = await this.db.getData<Product>('products')
    return products.filter(product => product.isUrgent)
  }

  async createProduct(product: Product): Promise<boolean> {
    return this.db.addItem('products', product)
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
    return this.db.updateItem('products', id, updates)
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.db.deleteItem('products', id)
  }

  async searchProducts(query: string): Promise<Product[]> {
    const products = await this.db.getData<Product>('products')
    const searchLower = query.toLowerCase()
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
    )
  }

  async getProductsByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Promise<Product[]> {
    const products = await this.db.getData<Product>('products')
    return products.filter(
      product =>
        product.discountedPrice >= minPrice && 
        product.discountedPrice <= maxPrice
    )
  }

  async getProductsByDiscountRange(
    minDiscount: number,
    maxDiscount: number
  ): Promise<Product[]> {
    const products = await this.db.getData<Product>('products')
    return products.filter(
      product =>
        product.discountPercentage >= minDiscount && 
        product.discountPercentage <= maxDiscount
    )
  }

  async getExpiringSoonProducts(daysThreshold: number = 7): Promise<Product[]> {
    const products = await this.db.getData<Product>('products')
    const now = new Date()
    
    return products.filter(product => {
      const expiryDate = new Date(product.expiryDate)
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0
    })
  }
} 