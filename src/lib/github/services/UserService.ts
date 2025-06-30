import { User } from '@/types'
import { GitHubDatabase } from '../database'
import { database } from '../database'

export class UserService {
  private db = GitHubDatabase.getInstance()

  async getAllUsers(): Promise<User[]> {
    return this.db.getData<User>('users')
  }

  async getUserById(id: string): Promise<User | null> {
    return await database.get(`users/${id}`)
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
    await database.delete(`users/${id}`)
    return this.db.deleteItem('users', id)
  }

  async updateUserPreferences(
    id: string,
    preferences: User['preferences']
  ): Promise<boolean> {
    return this.db.updateItem('users', id, { preferences })
  }

  async createOrUpdateUser(userData: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    type: 'user' | 'store';
  }): Promise<User> {
    const existingUser = await database.get(`users/${userData.id}`);
    
    const user: User = {
      ...userData,
      storeId: existingUser?.storeId
    };

    await database.set(`users/${userData.id}`, user);
    return user;
  }
} 