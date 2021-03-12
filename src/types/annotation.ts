export interface Annotation {
  endTime: number
  startTime: number
  summary: string
  stickers?: any
  stream?: string
  message?: string
}

export interface AnnotationResponse {
  stream: string
  annotations: Annotation[]
}

export interface AnnotationStream {
  stream: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface GetAnnotationPayload {
  stream?: string
  startTime?: string
  endTime?: string
  stickers?: any
}

export interface DeleteAnnotation {
  stream: string
  startTime: string
  endTime: string
  stickers?: any
}

export type AnnotationsList = {[stream: string]: Annotation[]}
