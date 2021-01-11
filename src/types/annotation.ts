export interface PostAnnotationResponse {
  stream: string
  'start-time': string
  'end-time': string
  summary: string
  stickers?: any
}

export interface PostAnnotationPayload {
  summary: string
}
