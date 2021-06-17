import {Secrets as GSecrets} from 'src/client'
import {NormalizedState} from 'src/types/resources'

export type Secret = GSecrets

export interface SecretsState extends NormalizedState<Secret> {
  key: string
}
