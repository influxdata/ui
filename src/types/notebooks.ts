import {
  Tag as GenTag,
  Schema as GenSchema,
  SchemaValues as GenSchemaValues,
} from '@influxdata/giraffe'

export interface Tag extends GenTag {}
export interface Schema extends GenSchema {}
export interface SchemaValues extends GenSchemaValues {}

export interface NormalizedTag {
  [tagName: string]: string[] | number[]
}

export interface NormalizedSchema {
  measurements: string[]
  fields: string[]
  tags: NormalizedTag[]
}
