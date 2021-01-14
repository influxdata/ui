export interface Annotation {
  end: string
  start: string
  summary: string
  stickers?: any
  stream?: string
  message?: string
}

export interface GetAnnotationResponse {
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

export interface UpdateAnnotationPayload {
  new: Annotation
  old: DeleteAnnotation
}
