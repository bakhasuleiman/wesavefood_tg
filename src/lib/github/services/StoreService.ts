import { Store, StoreProfile } from '@/types'
import { GitHubDatabase } from '../database'

export class StoreService {
  private db = GitHubDatabase.getInstance()

  async getAllStores(): Promise<Store[]> {
    return this.db.getData<Store>('stores')
  }

  async getStoreById(id: string): Promise<Store | null> {
    const stores = await this.db.getData<Store>('stores')
    return stores.find(store => store.id === id) || null
  }

  async getStoresByDistance(
    lat: number,
    lng: number,
    maxDistance: number
  ): Promise<Store[]> {
    const stores = await this.db.getData<Store>('stores')
    return stores.filter(store => {
      const distance = this.calculateDistance(
        lat,
        lng,
        store.coordinates.lat,
        store.coordinates.lng
      )
      return distance <= maxDistance
    })
  }

  async createStore(store: Store): Promise<boolean> {
    return this.db.addItem('stores', store)
  }

  async updateStore(id: string, updates: Partial<Store>): Promise<boolean> {
    return this.db.updateItem('stores', id, updates)
  }

  async deleteStore(id: string): Promise<boolean> {
    return this.db.deleteItem('stores', id)
  }

  async updateStoreRating(id: string, rating: number): Promise<boolean> {
    const store = await this.getStoreById(id)
    if (!store) return false

    return this.db.updateItem('stores', id, { rating })
  }

  async updateStoreEcoRating(id: string, ecoRating: number): Promise<boolean> {
    const store = await this.getStoreById(id)
    if (!store) return false

    return this.db.updateItem('stores', id, { ecoRating })
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371 // Радиус Земли в километрах
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }
} 