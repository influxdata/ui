// Types
import {GetAnnotationPayload} from 'src/types'

export const formatAnnotationQueryString = (
  annotation: GetAnnotationPayload,
  requestType?: string
): string => {
  const {stream, start, end, stickers} = annotation

  const getAnnotationParams = new URLSearchParams(
    JSON.parse(JSON.stringify({start, end}))
  )

  if (stream) {
    const streamParam = requestType === 'delete' ? 'stream' : 'streamIncludes'

    getAnnotationParams.append(streamParam, stream)
  }

  if (stickers) {
    Object.keys(stickers).forEach((s: string) => {
      getAnnotationParams.append(`stickerIncludes[${s}]`, stickers[s])
    })
  }

  return `?${getAnnotationParams.toString()}`
}
