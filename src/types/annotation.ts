export interface Annotation {
  endTime: number
  startTime: number
  summary: string
  stickers?: any
  stream?: string
  message?: string
}

export interface AnnotationStream {
  stream: string
  annotations: Annotation[]
}

export interface GetAnnotationPayload {
  stream?: string
  start?: string
  end?: string
  stickers?: any
}

export interface DeleteAnnotation {
  stream: string
  start: string
  end: string
  stickers?: any
}
