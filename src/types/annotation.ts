export interface PostAnnotationResponse {
  stream: string
  startTime: string
  summary: string
  stickers?: any
}

export interface PostAnnotationPayload {
  summary: string
}
