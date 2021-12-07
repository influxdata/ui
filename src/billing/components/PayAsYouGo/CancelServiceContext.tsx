// Libraries
import React, {FC, createContext, useState, ReactChild} from 'react'

interface Props {
  children: ReactChild
}

export enum VariableItems {
  NO_OPTION = '----',
  USE_CASE_DIFFERENT = "It doesn't work for my use case",
  SWITCHING_ORGANIZATION = 'I want to join my account to another organization',
  ALTERNATIVE_PRODUCT = 'I found an alternative product',
  RE_SIGNUP = 'I want to sign up for a new account using a marketplace option',
  TOO_EXPENSIVE = 'It’s too expensive',
  USABILITY_ISSUE = 'I found Flux hard to use',
  UNSTABLE_PLATFORM = 'Platform isn’t stable enough',
  UNSUPPORTED_HIGH_CARDINALITY = 'Platform doesn’t support my high Cardinality',
  OTHER_REASON = 'Other reason',
}

const RedirectLocations = {
  SWITCHING_ORGANIZATION: '/org_cancel',
  RE_SIGNUP: '/cancel',
}
const DEFAULT_REDIRECT_LOCATION = '/mkt_cancel'

export interface CancelServiceContextType {
  shortSuggestion: string
  isShortSuggestionEnabled: boolean
  setShortSuggestionFlag: (_: boolean) => void
  setShortSuggestion: (_: string) => void
  suggestions: string
  setSuggestions: (_: string) => void
  reason: string
  setReason: (_: string) => void
  canContactForFeedback: boolean
  toggleCanContactForFeedback: () => void
  getRedirectLocation: () => string
}

export const DEFAULT_CANCEL_SERVICE_CONTEXT: CancelServiceContextType = {
  shortSuggestion: '',
  isShortSuggestionEnabled: false,
  setShortSuggestionFlag: (_: boolean) => null,
  setShortSuggestion: (_: string) => null,
  suggestions: '',
  setSuggestions: (_: string) => null,
  reason: 'NO_OPTION',
  setReason: (_: string) => null,
  canContactForFeedback: false,
  toggleCanContactForFeedback: () => null,
  getRedirectLocation: () => DEFAULT_REDIRECT_LOCATION,
}

export const CancelServiceContext = createContext<CancelServiceContextType>(
  DEFAULT_CANCEL_SERVICE_CONTEXT
)

const CancelServiceProvider: FC<Props> = ({children}) => {
  const [shortSuggestion, setShortSuggestion] = useState(
    DEFAULT_CANCEL_SERVICE_CONTEXT.shortSuggestion
  )
  const [isShortSuggestionEnabled, setShortSuggestionFlag] = useState(
    DEFAULT_CANCEL_SERVICE_CONTEXT.isShortSuggestionEnabled
  )
  const [suggestions, setSuggestions] = useState(
    DEFAULT_CANCEL_SERVICE_CONTEXT.suggestions
  )
  const [reason, setReason] = useState(DEFAULT_CANCEL_SERVICE_CONTEXT.reason)
  const [canContactForFeedback, setCanContactForFeedback] = useState(
    DEFAULT_CANCEL_SERVICE_CONTEXT.canContactForFeedback
  )

  const toggleCanContactForFeedback = () => {
    setCanContactForFeedback(prev => !prev)
  }

  const getRedirectLocation = () => {
    const uri = RedirectLocations[reason] ?? '/mkt_cancel'

    return `https://www.influxdata.com${uri}`
  }

  return (
    <CancelServiceContext.Provider
      value={{
        shortSuggestion,
        isShortSuggestionEnabled,
        setShortSuggestionFlag,
        setShortSuggestion,
        suggestions,
        setSuggestions,
        reason,
        setReason,
        canContactForFeedback,
        toggleCanContactForFeedback,
        getRedirectLocation,
      }}
    >
      {children}
    </CancelServiceContext.Provider>
  )
}

export default CancelServiceProvider
