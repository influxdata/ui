import {MonacoType} from 'src/types'
import {ZuoraClient} from 'src/types/billing'
import {AdMinds} from 'src/types/adminds'

//
// Got some globals here that only exist during compilation
//

declare let monaco: MonacoType

declare global {
  let Z: ZuoraClient
  let _abcr: AdMinds
  interface Window {
    monaco: MonacoType
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

  declare module '*.svg' {
    export const ReactComponent: SFC<SVGProps<SVGSVGElement>>
    const src: string
    export default src
  }
}

window.monaco = window.monaco || {}
