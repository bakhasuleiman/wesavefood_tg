import { Octokit } from '@octokit/rest';
import { config } from './config';

class GitHubDatabase {
  private octokit: Octokit;
  private cache: Map<string, any>;

  constructor() {
    this.octokit = new Octokit({
      auth: config.GITHUB_TOKEN
    });
    this.cache = new Map();
  }

  private async getContent(path: string) {
    try {
      const response = await this.octokit.repos.getContent({
        owner: config.GITHUB_OWNER,
        repo: config.GITHUB_REPO,
        path: `data/${path}.json`,
        ref: config.GITHUB_BRANCH
      });

      if ('content' in response.data) {
        const content = Buffer.from(response.data.content, 'base64').toString();
        return JSON.parse(content);
      }
      return null;
    } catch (error) {
      if ((error as any).status === 404) {
        return null;
      }
      throw error;
    }
  }

  private async updateContent(path: string, content: any) {
    const currentFile = await this.octokit.repos.getContent({
      owner: config.GITHUB_OWNER,
      repo: config.GITHUB_REPO,
      path: `data/${path}.json`,
      ref: config.GITHUB_BRANCH
    }).catch(() => null);

    const contentStr = JSON.stringify(content, null, 2);
    
    await this.octokit.repos.createOrUpdateFileContents({
      owner: config.GITHUB_OWNER,
      repo: config.GITHUB_REPO,
      path: `data/${path}.json`,
      message: `Update ${path}`,
      content: Buffer.from(contentStr).toString('base64'),
      sha: currentFile && 'sha' in currentFile.data ? currentFile.data.sha : undefined,
      branch: config.GITHUB_BRANCH
    });
  }

  async get(path: string): Promise<any> {
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }
    const data = await this.getContent(path);
    if (data) {
      this.cache.set(path, data);
    }
    return data;
  }

  async set(path: string, data: any): Promise<void> {
    await this.updateContent(path, data);
    this.cache.set(path, data);
  }

  async delete(path: string): Promise<void> {
    const currentFile = await this.octokit.repos.getContent({
      owner: config.GITHUB_OWNER,
      repo: config.GITHUB_REPO,
      path: `data/${path}.json`,
      ref: config.GITHUB_BRANCH
    }).catch(() => null);

    if (currentFile && 'sha' in currentFile.data) {
      await this.octokit.repos.deleteFile({
        owner: config.GITHUB_OWNER,
        repo: config.GITHUB_REPO,
        path: `data/${path}.json`,
        message: `Delete ${path}`,
        sha: currentFile.data.sha,
        branch: config.GITHUB_BRANCH
      });
    }

    this.cache.delete(path);
  }
}

export const database = new GitHubDatabase(); 