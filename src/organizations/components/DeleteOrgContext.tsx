// Libraries
import React, {FC, createContext, useState, ReactChild} from 'react'

// Types

// Utils

interface Props {
  children: ReactChild
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
}

export const DEFAULT_DELETE_ORG_CONTEXT: DeleteOrgContextType = {
  shortSuggestion: '',
  isShortSuggestionEnabled: false,
  setShortSuggestionFlag: (_: boolean) => null,
  setShortSuggestion: (_: string) => null,
  suggestions: '',
  setSuggestions: (_: string) => null,
  reason: '',
  setReason: (_: string) => null,
}

export const DeleteOrgContext = createContext<DeleteOrgContextType>(
  DEFAULT_DELETE_ORG_CONTEXT
)

const DeleteOrgProvider: FC<Props> = ({children}) => {
  const [shortSuggestion, setShortSuggestion] = useState('')
  const [isShortSuggestionEnabled, setShortSuggestionFlag] = useState(false)
  const [suggestions, setSuggestions] = useState('')
  const [reason, setReason] = useState('')

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
      }}
    >
      {children}
    </DeleteOrgContext.Provider>
  )
}

export default DeleteOrgProvider
