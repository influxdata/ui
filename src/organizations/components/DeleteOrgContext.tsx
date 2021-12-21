// Libraries
import React, {FC, createContext, useState, ReactChild} from 'react'

// Types

// Utils

interface Props {
  children: ReactChild
}

export enum VariableItems {
  NO_OPTION = '----',
  USE_CASE_DIFFERENT = "It doesn't work for my use case",
  SWITCHING_ORGANIZATION = 'I want to join my account to another organization',
  ALTERNATIVE_PRODUCT = 'I found an alternative product',
  RE_SIGNUP = 'I want to sign up for a new account using a marketplace option',
  OTHER_REASON = 'Other reason',
}

export interface DeleteOrgContextType {
  shortSuggestion: string
  isShortSuggestionEnabled: boolean
  setShortSuggestionFlag: (_: boolean) => void
  setShortSuggestion: (_: string) => void
  suggestions: string
  setSuggestions: (_: string) => void
  reason: string
  setReason: (_: string) => void
  getRedirectLocation: () => string
}

export const DEFAULT_DELETE_ORG_CONTEXT: DeleteOrgContextType = {
  shortSuggestion: '',
  isShortSuggestionEnabled: false,
  setShortSuggestionFlag: (_: boolean) => null,
  setShortSuggestion: (_: string) => null,
  suggestions: '',
  setSuggestions: (_: string) => null,
  reason: 'NO_OPTION',
  setReason: (_: string) => null,
  getRedirectLocation: () => DEFAULT_REDIRECT_LOCATION,
}

const RedirectLocations = {
  SWITCHING_ORGANIZATION: '/org_cancel',
  RE_SIGNUP: '/cancel',
}
const DEFAULT_REDIRECT_LOCATION = '/mkt_cancel'

export const DeleteOrgContext = createContext<DeleteOrgContextType>(
  DEFAULT_DELETE_ORG_CONTEXT
)

const DeleteOrgProvider: FC<Props> = ({children}) => {
  const [shortSuggestion, setShortSuggestion] = useState(
    DEFAULT_DELETE_ORG_CONTEXT.shortSuggestion
  )
  const [isShortSuggestionEnabled, setShortSuggestionFlag] = useState(
    DEFAULT_DELETE_ORG_CONTEXT.isShortSuggestionEnabled
  )
  const [suggestions, setSuggestions] = useState(
    DEFAULT_DELETE_ORG_CONTEXT.suggestions
  )
  const [reason, setReason] = useState(DEFAULT_DELETE_ORG_CONTEXT.reason)

  const getRedirectLocation = () => {
    const uri = RedirectLocations[reason] ?? '/mkt_cancel'

    return `https://www.influxdata.com${uri}`
  }

  return (
    <DeleteOrgContext.Provider
      value={{
        shortSuggestion,
        isShortSuggestionEnabled,
        setShortSuggestionFlag,
        setShortSuggestion,
        suggestions,
        setSuggestions,
        reason,
        setReason,
        getRedirectLocation,
      }}
    >
      {children}
    </DeleteOrgContext.Provider>
  )
}

export default DeleteOrgProvider
