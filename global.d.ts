import {MonacoType, ZuoraClient, MonacoEnvironmentType} from 'src/types'
import {AdMinds} from 'src/types/adminds'

//
// Got some globals here that only exist during compilation
//

declare global {
  let Z: ZuoraClient
  let _abcr: AdMinds
  let monaco: MonacoType
  let MonacoEnvironment: MonacoEnvironmentType | undefined
  interface Window {
    monaco: MonacoType
    MonacoEnvironment?: MonacoEnvironmentType
    Z: ZuoraClient
    _abcr: AdMinds
  }
  declare module '*.png' {
    const value: any
    export = value
  }

  declare module '*.md' {
    const value: string
    export default value
  }

  declare module '*.example' {
    const value: string
    export default value
  }

  declare module '*.svg' {
    export const ReactComponent: SFC<SVGProps<SVGSVGElement>>
    const src: string
    export default src
  }
}
