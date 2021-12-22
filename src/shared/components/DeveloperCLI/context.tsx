// Libraries
import React, {
    FC,
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    useEffect,
  } from 'react'
import { BucketContext } from 'src/flows/context/buckets'

  enum CLIContext {
      Bucket,
      Notebook,
      Command
  }
  interface DeveloperCLIContextType {
    term: string
    setSearchTerm: (_: string) => void
    searchContext: CLIContext
    items: string[]
  }
  
  export const DEFAULT_CONTEXT: DeveloperCLIContextType = {
      term: '',
      setSearchTerm: (_: string) => null,
      searchContext: CLIContext.Command,
      items: []
  }
  
  export const DeveloperCLIContext = createContext<DeveloperCLIContextType>(
    DEFAULT_CONTEXT
  )

  const getCommands = (term: string): string[] => {
      term = term.trim()
      const commands = [
          'list', 'search'
      ]
      if (!term) {
          return commands
      }

      return commands.filter(c => c.startsWith(term))
  }
  
  export const DeveloperCLIProvider: FC = ({children}) => {
    const {buckets} = useContext(BucketContext)
    const [items, setItems] = useState(DEFAULT_CONTEXT.items)
    const [term, setTerm] = useState(DEFAULT_CONTEXT.term)
    const [searchContext, setSearchContext] = useState<CLIContext>(DEFAULT_CONTEXT.searchContext)

    const searchItems = useMemo((): string[] => {
        if (searchContext === CLIContext.Command) {
            return getCommands(term)
        }

        return []
    }, [term])

    const getNextContext = useCallback(() => {
        const tokens = term.split(' ')
        // Continue Here
    }, [term])

    const setSearchTerm = (searchTerm: string) => {
        setTerm(searchTerm.replaceAll('  ', ' '))
    }

    return (
      <DeveloperCLIContext.Provider
        value={{
            term,
            setSearchTerm,
            searchContext,
            items
        }}
      >
        {children}
      </DeveloperCLIContext.Provider>
    )
  }
  