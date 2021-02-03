export interface Annotation {
  end: number
  start: number
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
  start?: number
  end?: number
  stickers?: any
}

export interface DeleteAnnotation {
  stream: string
  start: number
  end: number
  stickers?: any
}
