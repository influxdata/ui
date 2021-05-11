import {FromFluxResult, FluxDataType, Table} from '@influxdata/giraffe'
import {FunctionComponent, ComponentClass, ReactNode} from 'react'
import {AutoRefresh, RemoteDataState, TimeRange} from 'src/types'

export interface ControlAction {
  title: string | (() => string)
  disable?: boolean | (() => boolean)
  action: () => void
}

export interface Submenu {
  title: string | (() => string)
  disable?: boolean | (() => boolean)
  menu: ReactNode
}

export interface ControlSection {
  title: string | (() => string)
  actions: (ControlAction | Submenu)[]
}

export interface PipeContextProps {
  children?: ReactNode
  controls?: ControlSection[]
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

export type Column =
  | {
      name: string
      type: 'number'
      fluxDataType: FluxDataType
      data: Array<number | null>
    } //  parses empty numeric values as null
  | {name: string; type: 'time'; fluxDataType: FluxDataType; data: number[]}
  | {name: string; type: 'boolean'; fluxDataType: FluxDataType; data: boolean[]}
  | {name: string; type: 'string'; fluxDataType: FluxDataType; data: string[]}

interface Columns {
  [columnKey: string]: Column
}

// This isn't actually optional, it just makes the type system work
interface InternalTable extends Table {
  columns?: Columns
}

interface InternalFromFluxResult extends FromFluxResult {
  table: InternalTable
}

export interface FluxResult {
  source: string // the query that was used to generate the flux
  parsed: InternalFromFluxResult // the parsed result
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
  byID: DataLookup<T>
  serialize: () => Resource<T>

  allIDs: string[]
  all: T[]
}

export interface FlowState {
  name: string
  range: TimeRange
  refresh: AutoRefresh
  data: Resource<PipeData>
  meta: Resource<PipeMeta>
  readOnly?: boolean
}

export interface Flow {
  name: string
  range: TimeRange
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
