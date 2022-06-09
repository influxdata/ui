import React, {FC, createContext, useRef} from 'react'

// Types
import {Bucket, Secret} from 'src/types'
import {FluxToolbarFunction, FluxFunction} from 'src/types/shared'

export enum InjectionType {
  Raw,
  Function,
  Variable,
  Secret,
  Field,
  Tag,
}

// override to shore up migration
export interface RawInjection {
  type: InjectionType.Raw
  text: string
}

export interface FunctionInjection {
  type: InjectionType.Function
  function: FluxToolbarFunction | FluxFunction
}

export interface VariableInjection {
  type: InjectionType.Variable
  variable: string
}

export interface SecretInjection {
  type: InjectionType.Secret
  secret: Secret
}

export interface FieldInjection {
  type: InjectionType.Field
  bucket: Bucket
  measurement: string
  field: string
}

export interface TagInjection {
  type: InjectionType.Tag
  bucket: Bucket
  measurement: string
  key: string
  value: string
}

export type Injection =
  | RawInjection
  | FunctionInjection
  | VariableInjection
  | SecretInjection
  | FieldInjection
  | TagInjection

interface InjectionContextType {
  inject: (injection: Injection) => void
  onInject: (cb: (injection: Injection) => void) => void
}

const DEFAULT_CONTEXT = {
  inject: _ => {},
  onInject: _ => {},
}

export const InjectionContext = createContext<InjectionContextType>(
  DEFAULT_CONTEXT
)

export const InjectionProvider: FC = ({children}) => {
  const injectCBs = useRef([])

  const inject = (injection: Injection) => {
    injectCBs.current.forEach(cb => cb(injection))
  }
  const onInject = (cb: (injection: Injection) => void) => {
    injectCBs.current.push(cb)
  }

  return (
    <InjectionContext.Provider
      value={{
        inject,
        onInject,
      }}
    >
      {children}
    </InjectionContext.Provider>
  )
}
