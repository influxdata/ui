// Write Data Modes
export enum WriteDataMode {
  Manual = 'Manual Entry',
  File = 'File Upload',
}

interface NewDataExplorerDataMeta {
  id: string
}

export type NewDataExplorerData = NewDataExplorerDataMeta | any