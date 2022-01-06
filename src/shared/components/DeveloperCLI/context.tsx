// Libraries
import React, {FC, createContext, useState, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'

enum CLIContext {
  Buckets = 'buckets',
  Notebooks = 'notebooks',
  Commands = 'commands',
  Docs = 'docs',
}
interface DeveloperCLIContextType {
  term: string
  setSearchTerm: (_: string) => void
  searchContext: CLIContext
  items: DeveloperCLIAutoCompleteItem[]
  selected: number | null
  setSelected: (_: number) => void
}

export const DEFAULT_CONTEXT: DeveloperCLIContextType = {
  term: '',
  setSearchTerm: (_: string) => null,
  searchContext: CLIContext.Commands,
  items: [],
  selected: null,
  setSelected: (_: number) => null,
}

export const DeveloperCLIContext = createContext<DeveloperCLIContextType>(
  DEFAULT_CONTEXT
)

const commands = {
  'search buckets': {
    cbFetch: async term => {
      const results = await fetch(`/api/v2/buckets?limit=100`, {
        method: 'GET',
      }).then(r => r.json())
      return results.buckets.filter(b => b.name.includes(term))
    },
    cbClick: (orgId, r) => {
      orgId
      if (r) {
        window.location.href = `/notebook/from/bucket/${r.name}`
      }
    },
  },
  'search notebooks': {
    cbFetch: async term => {
      const results = await fetch(`/api/v2private/notebooks?limit=1000`, {
        method: 'GET',
      }).then(r => r.json())
      return results.flows.filter(b => b.name.includes(term))
    },
    cbClick: (orgId, r) => {
      if (r) {
        window.location.href = `/orgs/${orgId}/notebooks/${r.id}`
      }
    },
  },
  'list buckets': {
    cbClick: orgId => {
      window.location.href = `/orgs/${orgId}/load-data/buckets`
    },
  },
  'list notebooks': {
    cbClick: orgId => {
      window.location.href = `/orgs/${orgId}/notebooks`
    },
  },
  'search docs': {
    cbClick: orgId => {
      orgId
    },
  },
}

export interface DeveloperCLIAutoCompleteItem {
  id: string
  title: string
  cbClick?: () => void
}

export const DeveloperCLIProvider: FC = ({children}) => {
  const org = useSelector(getOrg)
  const [term, setTerm] = useState(DEFAULT_CONTEXT.term)
  const [searchContext, setSearchContext] = useState<CLIContext>(
    DEFAULT_CONTEXT.searchContext
  )

  const [currentCommand, setCurrentCommand] = useState<string>('')
  const [autocompleteItems, setAutocompleteItems] = useState<
    DeveloperCLIAutoCompleteItem[]
  >([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!term && !currentCommand) {
      const items = Object.keys(commands)
        .filter(k => k.startsWith(term))
        .map(k => {
          return {
            id: k,
            title: k,
            cbClick: () => commands[k]?.cbClick && commands[k].cbClick(org.id),
          }
        })
      setAutocompleteItems(items ?? [])
    }
  }, [currentCommand, term, org.id])

  useEffect(() => {
    if (!currentCommand) {
      return
    }

    setCurrentCommand('')
  }, [currentCommand])

  useEffect(() => {
    if (!term.trim()) {
      return
    }
    if (!currentCommand) {
      const items = Object.keys(commands)
        .filter(k => k.startsWith(term))
        .map(k => {
          return {
            id: k,
            title: k,
            cbClick: () => commands[k]?.cbClick && commands[k].cbClick(org.id),
          }
        })
      setAutocompleteItems(items ?? [])
      return
    }

    const argument = term.replace(currentCommand, '').trim()
    if (commands[currentCommand]?.cbFetch) {
      commands[currentCommand]?.cbFetch(argument).then(r => {
        setAutocompleteItems(
          r.map(e => {
            return {
              id: e.id,
              title: e.name,
              cbClick: () =>
                commands[currentCommand]?.cbClick &&
                commands[currentCommand].cbClick(org.id, e),
            }
          })
        )
      })
    }
  }, [term, currentCommand, org?.id])

  const setSearchTerm = searchTerm => {
    searchTerm = searchTerm.replaceAll('  ', ' ')
    const {context, command} = determineSearchContext(searchTerm)
    if (!!context) {
      setTerm(searchTerm)
      setSearchContext(context)
    }
    if (!!command) {
      setCurrentCommand(command)
    }
  }

  const getContext = (searchTerm: string) => {
    const last = searchTerm.split(' ').pop()
    switch (last) {
      case 'buckets':
        return CLIContext.Buckets
      case 'notebooks':
        return CLIContext.Notebooks
      case 'search':
      case 'list':
        return CLIContext.Commands
      case 'docs':
        return CLIContext.Docs
    }
  }

  const determineSearchContext = (searchTerm: string) => {
    const commandKeys = Object.keys(commands)
    const found = commandKeys.filter(k => k.startsWith(searchTerm))
    if (found.length > 1) {
      return {context: CLIContext.Commands, command: null}
    } else if (found.length === 1) {
      return {context: getContext(found[0]), command: null}
    } else {
      const searchFound = commandKeys.find(k => searchTerm.startsWith(k))
      if (searchFound) {
        return {context: getContext(searchFound), command: searchFound}
      }

      return {context: null, command: null}
    }
  }

  return (
    <DeveloperCLIContext.Provider
      value={{
        term,
        setSearchTerm,
        searchContext,
        items: autocompleteItems,
        selected,
        setSelected,
      }}
    >
      {children}
    </DeveloperCLIContext.Provider>
  )
}
