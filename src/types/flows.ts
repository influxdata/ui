import {FromFluxResult, FluxDataType, Table} from '@influxdata/giraffe'
import {FunctionComponent, ComponentClass, ReactNode} from 'react'
import {AutoRefresh, TimeRange, Variable} from 'src/types'

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
  controls?: ReactNode
  persistentControls?: ReactNode
  resizes?: boolean
}

export type PipeData = any

export type Visibility = 'visible' | 'hidden'

interface Layout {
  x: number
  y: number
  h: number
  w: number
}

export interface PipeMeta {
  title: string
  height?: number
  visible: boolean
  error?: string
  layout?: Layout
}

export interface PipeProp {
  Context:
    | FunctionComponent<PipeContextProps>
    | ComponentClass<PipeContextProps>
  readOnly?: boolean
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

export interface InternalFromFluxResult extends FromFluxResult {
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

export interface FlowState {
  id?: string
  name: string
  range: TimeRange
  refresh: AutoRefresh
  data: Resource<PipeData>
  meta: Resource<PipeMeta>
  readOnly?: boolean
}

export interface Flow {
  id?: string
  name: string
  range: TimeRange
  refresh: AutoRefresh
  data: Resource<PipeData>
  meta: Resource<PipeMeta>
  results: FluxResult
  readOnly?: boolean
  createdAt?: Date
  updatedAt?: Date
  createdBy?: string
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

export interface VariableMap {
  [key: string]: Variable
}

// TODO: type this better. there are required properties, that have types, but
// we also need this to stay open for panels to register whatever they want
export interface QueryScope {
  [props: string]: any
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
  readOnlyComponent?: FunctionComponent<PipeProp> | ComponentClass<PipeProp> // the view component for rendering the interface in read only mode
  button: string // a human readable string for appending the type
  initial: any // the default state for an add
  scope?: (data: PipeData, prev: QueryScope) => QueryScope // if defined, the function is expected to take a query context and return a new one
  visual?: (data: PipeData, query: string, scope?: QueryScope) => string // generates the flux used for the pipe visualization (depreciate?)
  source?: (data: PipeData, query: string, scope?: QueryScope) => string // generates the source flux that is passed between panels
}

export interface EndpointTypeRegistration {
  type: string // a unique string that identifies an endpoint
  name: string
  data: any
  component: FunctionComponent | ComponentClass
  readOnlyComponent: FunctionComponent | ComponentClass
  generateImports: Function
  generateTestImports: Function
  generateQuery: Function
  generateTestQuery: Function
}
