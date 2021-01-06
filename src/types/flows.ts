import {FromFluxResult} from '@influxdata/giraffe'
import {FunctionComponent, ComponentClass, ReactNode} from 'react'
import {
  AutoRefresh,
  RemoteDataState,
  SelectableDurationTimeRange,
} from 'src/types'

export interface Tag {
  [tagName: string]: Set<string | number>
}

export interface SchemaValues {
  fields: string[]
  tags: Tag
  type?: string
}

export interface Schema {
  [measurement: string]: SchemaValues
}

export interface NormalizedTag {
  [tagName: string]: string[] | number[]
}

export interface NormalizedSchema {
  measurements: string[]
  fields: string[]
  tags: NormalizedTag[]
}

export interface PipeContextProps {
  children?: ReactNode
  controls?: ReactNode
  persistentControl?: ReactNode
}

export type PipeData = any

export type Visibility = 'visible' | 'hidden'

export interface PipeMeta {
  title: string
  visible: boolean
  loading: RemoteDataState
  error?: string
}

export interface PipeProp {
  Context:
    | FunctionComponent<PipeContextProps>
    | ComponentClass<PipeContextProps>
}

export interface FluxResult {
  source: string // the query that was used to generate the flux
  raw: string // the result from the API
  parsed: FromFluxResult // the parsed result
  error?: string // any error that might have happend while fetching
}

interface DataLookup<T> {
  [key: string]: T
}

export interface Resource<T> {
  byID: DataLookup<T>
  allIDs: string[]
}

export type ResourceGenerator<T> = () => T | T
export type ResourceUpdater<T> = (resource: Resource<T>) => void

export interface ResourceManipulator<T> {
  get: (id: string) => T
  add: (id: string, data?: T) => void
  update: (id: string, data: Partial<T>) => void
  remove: (id: string) => void
  indexOf: (id: string) => number
  move: (id: string, index: number) => void

  serialize: () => Resource<T>

  allIDs: string[]
  all: T[]
}

export interface FlowState {
  name: string
  range: SelectableDurationTimeRange
  refresh: AutoRefresh
  data: Resource<PipeData>
  meta: Resource<PipeMeta>
  readOnly?: boolean
}

export interface Flow {
  name: string
  range: SelectableDurationTimeRange
  refresh: AutoRefresh
  data: ResourceManipulator<PipeData>
  meta: ResourceManipulator<PipeMeta>
  results: FluxResult
  readOnly?: boolean
}

export interface FlowListState {
  flows: {
    [key: string]: Resource<FlowState>
  }
}

export interface FlowList {
  flows: {
    [key: string]: Flow
  }
}

// NOTE: keep this interface as small as possible and
// don't take extending it lightly. this should only
// define what ALL pipe types require to be included
// on the page.
export interface TypeRegistration {
  type: string // a unique string that identifies a pipe
  family:
    | 'inputs'
    | 'passThrough'
    | 'test'
    | 'transform'
    | 'output'
    | 'sideEffects' // dictates grouping of related pipes
  priority?: number // 0 is lowest priority, equal priorities revert to string comparison
  disabled?: boolean // if you should show it or not
  featureFlag?: string // designates a flag that should enable the panel type
  component: FunctionComponent<PipeProp> | ComponentClass<PipeProp> // the view component for rendering the interface
  button: string // a human readable string for appending the type
  initial: any // the default state for an add
  generateFlux?: (
    pipe: PipeData,
    create: (text: string, loadPrevious?: boolean) => void,
    append: () => void,
    withSideEffects?: boolean
  ) => void // Generates the flux used to grab data from the backend
}
