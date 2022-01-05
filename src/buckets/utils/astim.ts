import {parse} from 'src/external/parser'
import {findNodes} from 'src/shared/utils/ast'

// Types
import {File, MemberExpression} from 'src/types'

export interface ASTIM {
  buckets: MemberExpression[]
  getAST: () => File
  hasBucket: (v: string) => boolean
  bucketNames: string[]
}

const parseAllBuckets = (ast: File): MemberExpression[] => {
  return findNodes(ast, node => {
    return node?.type === 'Property' && node?.key?.name === 'bucket'
  })
}

export const parseASTIM = (query: string): ASTIM => {
  const ast: File = parse(query)
  // Using `any` to circumvent ts error
  const buckets: any = ast ? parseAllBuckets(ast) : []

  const bucketNames = []
  buckets.forEach(bucket => {
    bucketNames.push(bucket.value.value)
  })

  const hasBucket = (bucket: string): boolean => {
    return bucketNames.includes(bucket)
  }

  const getAST = (): File => {
    return ast
  }

  return {
    getAST,
    buckets,
    hasBucket,
    bucketNames,
  }
}
