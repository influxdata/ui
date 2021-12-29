import {Label} from 'src/types'

export interface DocumentCreate {
  meta: DocumentMeta
  content: any
  org?: string
  orgID?: string
  labels?: Array<string>
}

export interface DocumentMeta {
  name: string
  type?: string
  description?: string
  version: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Document {
  id: string
  meta: DocumentMeta
  content: any
  labels?: Array<Label>
  links?: DocumentLinks
}

export interface DocumentLinks {
  self?: string
}

export interface DocumentListEntry {
  id: string
  meta: DocumentMeta
  labels?: Array<Label>
  links?: DocumentLinks
}
