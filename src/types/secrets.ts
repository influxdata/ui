import {Secrets as GSecrets} from 'src/client'

import {RemoteDataState} from 'src/types'

export interface Secret extends GSecrets {
  id: string
  key: string
  value?: string
  status?: RemoteDataState
}
