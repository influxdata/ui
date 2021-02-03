// Types
import {GetAnnotationPayload} from 'src/types'

export const formatAnnotationQueryString = (
  annotation?: GetAnnotationPayload,
  requestType?: string
): string => {
  const getAnnotationParams = new URLSearchParams({})

  if (annotation.start) {
    getAnnotationParams.append(
      'start',
      new Date(annotation.start).toISOString()
    )
  }

  if (annotation.end) {
    getAnnotationParams.append('end', new Date(annotation.end).toISOString())
  }

  if (annotation?.stream) {
    const streamParam = requestType === 'delete' ? 'stream' : 'streamIncludes'

    getAnnotationParams.append(streamParam, annotation.stream)
  }

  if (annotation?.stickers) {
    Object.keys(annotation.stickers).forEach((s: string) => {
      getAnnotationParams.append(
        `stickerIncludes[${s}]`,
        annotation.stickers[s]
      )
    })
  }

  return `${getAnnotationParams.toString()}`
}
