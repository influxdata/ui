export interface PostAnnotationResponse {
  stream: string
  endTime: string
  startTime: string
  summary: string
  stickers?: any
}

export interface PostAnnotationPayload {
  summary: string
}
