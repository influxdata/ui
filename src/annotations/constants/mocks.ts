// Mock data & types for annotations work

export interface AnnotationStream {
  id: string
  name: string
  description?: string
  meta: {
    createdAt: string
    updatedAt: string
  }
  display: {
    color: string
    summaryCol: string
    messageCol: string
    timeStartCol: string
    timeStopCol: string
  }
  query: {
    tags?: {
      [key: string]: string
    }
    measurement: string
    bucketName: string
  }
}

export const MOCK_ANNOTATION_STREAMS: AnnotationStream[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Default Annotation stream',
    meta: {
      createdAt: '2d ago',
      updatedAt: '6h ago',
    },
    display: {
      color: '#8e1fc3',
      summaryCol: 'summary',
      messageCol: 'message',
      timeStartCol: '_timeStart',
      timeStopCol: '_timeStop',
    },
    query: {
      tags: {
        _field: 'deployments',
      },
      measurement: 'annotations',
      bucketName: 'defBuck',
    },
  },
]
