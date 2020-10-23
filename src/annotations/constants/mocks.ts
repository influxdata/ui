// Mock data & types for annotations work
export interface AnnotationStream {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export type AnnotationStreamSortKey = keyof AnnotationStream

export const MOCK_ANNOTATION_STREAMS: AnnotationStream[] = [
  {
    id: 'anno1',
    name: 'Deployments',
    description: 'Event data for deployments',
    createdAt: 'sfsdf',
    updatedAt: 'sdfsd',
  },
  {
    id: 'anno2',
    name: 'Snacks',
    description: 'Tracking every time I eat a snack',
    createdAt: 'sfsdf',
    updatedAt: 'sdfsd',
  },
  {
    id: 'anno3',
    name: 'HydroHomies',
    description: 'Tracking every time someone on the team hydrates',
    createdAt: 'sfsdf',
    updatedAt: 'sdfsd',
  },
]
