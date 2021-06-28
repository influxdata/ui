import {Secrets as GSecrets} from 'src/client'
<<<<<<< HEAD

export type Secret = GSecrets
=======
import {NormalizedState} from 'src/types/resources'

export type Secret = GSecrets

export interface SecretsState extends NormalizedState<Secret> {
  key: string
}
>>>>>>> 13f44092cb7d2b696603ceac41cf78b9877e0998
