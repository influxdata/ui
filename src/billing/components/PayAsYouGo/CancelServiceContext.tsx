// Libraries
import React, {FC, createContext, useState, ReactChild} from 'react'

interface Props {
  children: ReactChild
}

export enum CancelationReasons {
  ALTERNATIVE_PRODUCT = 'I found an alternative product',
  NONE = '----',
  RE_SIGNUP = 'I want to sign up for a new account using a marketplace option',
  SWITCHING_ORGANIZATION = 'I want to join my account to another organization',
  TOO_EXPENSIVE = 'It’s too expensive',
  UNSUPPORTED_HIGH_CARDINALITY = 'Platform doesn’t support my high Cardinality',
  UNSTABLE_PLATFORM = 'Platform isn’t stable enough',
  USABILITY_ISSUE = 'I found Flux hard to use',
  USE_CASE_DIFFERENT = "It doesn't work for my use case",
  OTHER_REASON = 'Other reason',
}

const RedirectLocations = {
  SWITCHING_ORGANIZATION: '/org_cancel',
  RE_SIGNUP: '/cancel',
}
const DEFAULT_REDIRECT_LOCATION = '/mkt-cancel'

// Ensures that the default cancelation "reason" is always the key name for the "NONE" enum.
const getDefaultCancelationReason = () => {
  return Object.keys(CancelationReasons).filter(
    reason => CancelationReasons[reason] === CancelationReasons.NONE
  )[0]
}

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
  reason: getDefaultCancelationReason(),
  setReason: (_: string) => null,
  canContactForFeedback: false,
  toggleCanContactForFeedback: () => null,
  getRedirectLocation: () => DEFAULT_REDIRECT_LOCATION,
}

export const CancelServiceContext = createContext<CancelServiceContextType>(
  DEFAULT_CANCEL_SERVICE_CONTEXT
)

export const CancelServiceProvider: FC<Props> = ({children}) => {
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
    const uri = RedirectLocations[reason] ?? '/mkt-cancel'

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
