import {Bucket} from 'src/types'

export const formatQueryText = (queryText: string): string => {
  return (queryText || '')
    .trim()
    .split('|>')
    .join('\n  |>')
}

export const getNewestBucket = (
  oldBuckets: Bucket[],
  newBuckets: Bucket[]
): Bucket | null => {
  if (oldBuckets.length === newBuckets.length) {
    return null
  }

  const oldBucketIDs = oldBuckets.map(b => b.id)
  const newBucketIDs = newBuckets.map(b => b.id)

  const uniqueIDs = []

  newBucketIDs.forEach(id => {
    if (!oldBucketIDs.includes(id)) {
      uniqueIDs.push(id)
    }
  })

  if (uniqueIDs.length && uniqueIDs.length === 1) {
    return newBuckets.find(bucket => bucket.id === uniqueIDs[0])
  }

  return null
}
