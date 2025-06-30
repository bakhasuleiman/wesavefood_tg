import { octokit, GITHUB_CONFIG, DATA_PATHS, DataFileType, CACHE_TTL } from './config'
import { Base64 } from 'js-base64'

/**
 * Базовые функции для работы с GitHub как базой данных
 */
export class GitHubDatabase {
  private static instance: GitHubDatabase
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_TTL = CACHE_TTL

  private constructor() {}

  static getInstance(): GitHubDatabase {
    if (!GitHubDatabase.instance) {
      GitHubDatabase.instance = new GitHubDatabase()
    }
    return GitHubDatabase.instance
  }

  /**
   * Получение данных из файла
   */
  async getData<T>(fileType: DataFileType): Promise<T[]> {
    const cached = this.cache.get(fileType)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }

    try {
      const response = await octokit.repos.getContent({
        owner: GITHUB_CONFIG.owner,
        repo: GITHUB_CONFIG.repo,
        path: DATA_PATHS[fileType],
        ref: GITHUB_CONFIG.branch,
      })

      if ('content' in response.data) {
        const content = Base64.decode(response.data.content)
        const data = JSON.parse(content)
        
        this.cache.set(fileType, {
          data,
          timestamp: Date.now(),
        })
        
        return data
      }
      return []
    } catch (error) {
      if ((error as any).status === 404) {
        // Если файл не существует, создаем его с пустым массивом
        await this.saveData(fileType, [])
        return []
      }
      console.error(`Error fetching ${fileType}:`, error)
      return []
    }
  }

  /**
   * Сохранение данных в файл
   */
  async saveData<T>(fileType: DataFileType, data: T[]): Promise<boolean> {
    try {
      const content = JSON.stringify(data, null, 2)
      const encodedContent = Base64.encode(content)

      // Получаем текущий SHA файла
      let sha: string | undefined
      try {
        const currentFile = await octokit.repos.getContent({
          owner: GITHUB_CONFIG.owner,
          repo: GITHUB_CONFIG.repo,
          path: DATA_PATHS[fileType],
          ref: GITHUB_CONFIG.branch,
        })
        if ('sha' in currentFile.data) {
          sha = currentFile.data.sha
        }
      } catch (error) {
        // Файл не существует
      }

      // Сохраняем файл
      await octokit.repos.createOrUpdateFileContents({
        owner: GITHUB_CONFIG.owner,
        repo: GITHUB_CONFIG.repo,
        path: DATA_PATHS[fileType],
        message: `Update ${fileType} data`,
        content: encodedContent,
        sha,
        branch: GITHUB_CONFIG.branch,
      })

      // Обновляем кэш
      this.cache.set(fileType, {
        data,
        timestamp: Date.now(),
      })

      return true
    } catch (error) {
      console.error(`Error saving ${fileType}:`, error)
      return false
    }
  }

  /**
   * Добавление нового элемента
   */
  async addItem<T extends { id: string }>(fileType: DataFileType, item: T): Promise<boolean> {
    const data = await this.getData<T>(fileType)
    
    // Проверяем уникальность ID
    if (data.some(existingItem => existingItem.id === item.id)) {
      throw new Error(`Item with id ${item.id} already exists in ${fileType}`)
    }
    
    data.push(item)
    return this.saveData(fileType, data)
  }

  /**
   * Обновление существующего элемента
   */
  async updateItem<T extends { id: string }>(
    fileType: DataFileType,
    id: string,
    updates: Partial<T>
  ): Promise<boolean> {
    const data = await this.getData<T>(fileType)
    const index = data.findIndex(item => item.id === id)
    
    if (index === -1) return false
    
    data[index] = { ...data[index], ...updates, updatedAt: new Date() }
    return this.saveData(fileType, data)
  }

  /**
   * Удаление элемента
   */
  async deleteItem<T extends { id: string }>(
    fileType: DataFileType,
    id: string
  ): Promise<boolean> {
    const data = await this.getData<T>(fileType)
    const filteredData = data.filter(item => item.id !== id)
    
    if (filteredData.length === data.length) return false
    
    return this.saveData(fileType, filteredData)
  }

  /**
   * Поиск элементов по условию
   */
  async findItems<T>(
    fileType: DataFileType,
    predicate: (item: T) => boolean
  ): Promise<T[]> {
    const data = await this.getData<T>(fileType)
    return data.filter(predicate)
  }

  /**
   * Очистка кэша
   */
  clearCache(fileType?: DataFileType) {
    if (fileType) {
      this.cache.delete(fileType)
    } else {
      this.cache.clear()
    }
  }
} 