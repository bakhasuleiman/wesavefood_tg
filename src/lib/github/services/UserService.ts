import { User } from '@/types'
import { GitHubDatabase } from '../database'

export class UserService {
  private db = GitHubDatabase.getInstance()

  async getAllUsers(): Promise<User[]> {
    return this.db.getData<User>('users')
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.db.getData<User>('users')
    return users.find(user => user.id === id) || null
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const users = await this.db.getData<User>('users')
    return users.find(user => user.phone === phone) || null
  }

  async createUser(user: User): Promise<boolean> {
    return this.db.addItem('users', user)
  }

  async updateUser(id: string, updates: Partial<User>): Promise<boolean> {
    return this.db.updateItem('users', id, updates)
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.db.deleteItem('users', id)
  }

  async updateUserPreferences(
    id: string,
    preferences: User['preferences']
  ): Promise<boolean> {
    return this.db.updateItem('users', id, { preferences })
  }
} 