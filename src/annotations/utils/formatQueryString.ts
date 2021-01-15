// Types
import {GetAnnotationPayload} from 'src/types'

export const formatAnnotationQueryString = (
  annotation?: GetAnnotationPayload,
  requestType?: string
): string => {
  const getAnnotationParams = new URLSearchParams({})

  if (annotation.start) {
    getAnnotationParams.append('start', annotation.start)
  }

  if (annotation.end) {
    getAnnotationParams.append('end', annotation.end)
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
