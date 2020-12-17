import {parse} from 'src/external/parser'
import {Bucket} from 'src/types'

export const formatQueryText = (queryText: string): string => {
  return (queryText || '')
    .trim()
    .split('|>')
    .join('\n  |>')
}

export const findOrgID = (text: string, buckets: Bucket[]) => {
  const ast = parse(text)

  const _search = (node, acc = []) => {
    if (!node) {
      return acc
    }
    if (
      node?.type === 'CallExpression' &&
      node?.callee?.type === 'Identifier' &&
      node?.callee?.name === 'from' &&
      node?.arguments[0]?.properties[0]?.key?.name === 'bucket'
    ) {
      acc.push(node)
    }

    Object.values(node).forEach(val => {
      if (Array.isArray(val)) {
        val.forEach(_val => {
          _search(_val, acc)
        })
      } else if (typeof val === 'object') {
        _search(val, acc)
      }
    })

    return acc
  }

  const queryBuckets = _search(ast).map(
    node => node?.arguments[0]?.properties[0]?.value.value
  )

  const bucket = buckets.find(buck => queryBuckets.includes(buck.name))

  return bucket?.orgID
}
