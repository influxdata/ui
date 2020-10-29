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
    id: 'anno1',
    name: 'Deployments',
    description: 'Event data for deployments',
    meta: {
      createdAt: '2d ago',
      updatedAt: '6h ago',
    },
    display: {
      color: '#ffffff',
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
  {
    id: 'anno2',
    name: 'Snacks',
    description: 'Tracking every time I eat a snack',
    meta: {
      createdAt: '2d ago',
      updatedAt: '6h ago',
    },
    display: {
      color: '#00ff90',
      summaryCol: 'summary',
      messageCol: 'message',
      timeStartCol: '_timeStart',
      timeStopCol: '_timeStop',
    },
    query: {
      tags: {
        _field: 'snacks',
      },
      measurement: 'annotations',
      bucketName: 'defBuck',
    },
  },
  {
    id: 'anno3',
    name: 'HydroHomies',
    description: 'Tracking every time someone on the team hydrates',
    meta: {
      createdAt: '2d ago',
      updatedAt: '6h ago',
    },
    display: {
      color: '#2973fa',
      summaryCol: 'summary',
      messageCol: 'message',
      timeStartCol: '_timeStart',
      timeStopCol: '_timeStop',
    },
    query: {
      tags: {
        _field: 'hydrohomies',
        water: 'filtered',
        flavor: 'awesome',
      },
      measurement: 'annotations',
      bucketName: 'defBuck',
    },
  },
]
