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

type Annotation = {
  endTime: string
  startTime: string
  summary: string
  stickers?: any
}
export interface GetAnnotationResponse {
  stream: string
  annotations: Annotation[]
}

export interface GetAnnotationPayload {
  stream: string
  startTime: string
  endTime: string
  summary: string
  sticker: any
}
