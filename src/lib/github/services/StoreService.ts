import { User } from '@/types'
import { database } from '../database'
import { v4 as uuidv4 } from 'uuid'

export class StoreService {
  async createStore(storeData: {
    name: string;
    username: string;
    avatar?: string;
  }): Promise<User> {
    const id = uuidv4()
    const now = new Date().toISOString()
    
    const store: User = {
      id,
      ...storeData,
      type: 'store',
      storeId: id,
      createdAt: now,
      updatedAt: now
    }

    await database.set(`stores/${id}`, store)
    return store
  }

  async updateStore(id: string, updates: Partial<Omit<User, 'id' | 'type' | 'storeId' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    const existingStore = await database.get(`stores/${id}`)
    if (!existingStore) return null

    const updatedStore: User = {
      ...existingStore,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await database.set(`stores/${id}`, updatedStore)
    return updatedStore
  }

  async getStoreById(id: string): Promise<User | null> {
    return await database.get(`stores/${id}`)
  }

  async deleteStore(id: string): Promise<void> {
    await database.delete(`stores/${id}`)
  }

  async getAllStores(): Promise<User[]> {
    const stores = await database.get('stores') || {}
    return Object.values(stores).filter((store: User) => store.type === 'store')
  }

  async getStoresByDistance(
    lat: number,
    lng: number,
    maxDistance: number
  ): Promise<User[]> {
    const stores = await this.getAllStores()
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

  async updateStoreRating(id: string, rating: number): Promise<boolean> {
    const store = await this.getStoreById(id)
    if (!store) return false

    return this.updateStore(id, { rating })
  }

  async updateStoreEcoRating(id: string, ecoRating: number): Promise<boolean> {
    const store = await this.getStoreById(id)
    if (!store) return false

    return this.updateStore(id, { ecoRating })
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