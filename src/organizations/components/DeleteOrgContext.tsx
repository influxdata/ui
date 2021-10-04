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
  changeShortSuggestionFlag: (_: boolean) => void
  changeShortSuggestion: (_: string) => void
  suggestions: string
  changeSuggestions: (_: string) => void
}

export const DEFAULT_DELETE_ORG_CONTEXT: DeleteOrgContextType = {
  shortSuggestion: '',
  isShortSuggestionEnabled: false,
  changeShortSuggestionFlag: (_: boolean) => null,
  changeShortSuggestion: (_: string) => null,
  suggestions: '',
  changeSuggestions: (_: string) => null,
}

export const DeleteOrgContext = createContext<DeleteOrgContextType>(
  DEFAULT_DELETE_ORG_CONTEXT
)

const DeleteOrgProvider: FC<Props> = ({children}) => {
  const [shortSuggestion, setShortSuggestion] = useState('')
  const [isShortSuggestionEnabled, setEnableShortSuggestion] = useState(false)
  const [suggestions, setSuggestions] = useState('')

  const changeShortSuggestion = suggestion => {
    setShortSuggestion(suggestion)
  }

  const changeShortSuggestionFlag = (flag: boolean) => {
    setEnableShortSuggestion(flag)
  }

  const changeSuggestions = newSuggestions => {
    setSuggestions(newSuggestions)
  }

  return (
    <DeleteOrgContext.Provider
      value={{
        shortSuggestion,
        isShortSuggestionEnabled,
        changeShortSuggestionFlag,
        changeShortSuggestion,
        suggestions,
        changeSuggestions,
      }}
    >
      {children}
    </DeleteOrgContext.Provider>
  )
}

export default DeleteOrgProvider
