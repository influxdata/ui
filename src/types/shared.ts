import {ReactNode, ComponentType} from 'react'
import {Fluxdocs as FluxdocsRouteT} from 'src/client/fluxdocsdRoutes'

export interface DropdownItem {
  text: string
}

export interface DropdownAction {
  icon: string
  text: string
  handler: () => void
}

export interface PageSection {
  url: string
  name: string
  component: ReactNode
  enabled: boolean
}

export interface FluxToolbarArg {
  name: string
  desc: string
  type: string
}

export interface FluxToolbarFunction {
  name: string
  args: FluxToolbarArg[]
  desc: string
  package: string
  example: string
  category: string
  link: string
}

// FIXME: confirm if this is really FluxFuntions?
// or also contains other docs for additional flux language features.
export type FluxDocs = FluxdocsRouteT
export type FluxFunction = FluxDocs

export type ErrorMessageComponent = ComponentType<{error: Error}>

export interface Pageable {
  currentPage: number
  rowsPerPage: number
  totalPages: number
  paginate: (newPage: number) => void
}
