export interface Annotation {
  endTime: number
  id?: string
  message?: string
  startTime: number
  stickers?: any
  stream?: string
  summary: string
}

export interface EditAnnotation {
  id: string
  message: string
  startTime: string
  stream: string
  summary: string
}

export interface AnnotationResponse {
  annotations: Annotation[]
  stream: string
}

export interface AnnotationStream {
  color: string
  createdAt?: string
  description?: string
  stream: string
  updatedAt?: string
}

export interface GetAnnotationPayload {
  endTime?: string
  startTime?: string
  stickers?: any
  stream?: string
}

export interface DeleteAnnotation {
  endTime: string
  id: string
  startTime: string
  stickers?: any
  stream: string
}

export type AnnotationsList = {[stream: string]: Annotation[]}
