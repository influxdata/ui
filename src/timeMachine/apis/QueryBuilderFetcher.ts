// APIs
import {
  findKeys,
  findValues,
  FindKeysOptions,
  FindValuesOptions,
} from 'src/timeMachine/apis/queryBuilder'

// Types
import {CancelBox} from 'src/types'

type CancelableQuery = CancelBox<string[]>

class QueryBuilderFetcher {
  private findKeysQueries: CancelableQuery[] = []
  private findValuesQueries: CancelableQuery[] = []
  private findKeysCache: {[key: string]: string[]} = {}
  private findValuesCache: {[key: string]: string[]} = {}

  public async findKeys(
    index: number,
    options: FindKeysOptions
  ): Promise<string[]> {
    this.cancelFindKeys(index)

    const cacheKey = JSON.stringify(options)
    const cachedResult = this.findKeysCache[cacheKey]

    if (cachedResult) {
      return Promise.resolve(cachedResult)
    }

    const pendingResult = findKeys(options)

    this.findKeysQueries[index] = pendingResult

    pendingResult.promise
      .then(result => {
        this.findKeysCache[cacheKey] = result
      })
      .catch(() => {})

    return pendingResult.promise
  }

  public cancelFindKeys(index: number): void {
    if (this.findKeysQueries[index]) {
      this.findKeysQueries[index].cancel()
    }
  }

  public async findValues(
    index: number,
    options: FindValuesOptions
  ): Promise<string[]> {
    this.cancelFindValues(index)

    const cacheKey = JSON.stringify(options)
    const cachedResult = this.findValuesCache[cacheKey]

    if (cachedResult) {
      return Promise.resolve(cachedResult)
    }

    const pendingResult = findValues(options)

    this.findValuesQueries[index] = pendingResult

    pendingResult.promise
      .then(result => {
        this.findValuesCache[cacheKey] = result
      })
      .catch(() => {})

    return pendingResult.promise
  }

  public cancelFindValues(index: number): void {
    if (this.findValuesQueries[index]) {
      this.findValuesQueries[index].cancel()
    }
  }

  public clearCache(): void {
    this.findKeysCache = {}
    this.findValuesCache = {}
  }
}

export const queryBuilderFetcher = new QueryBuilderFetcher()
