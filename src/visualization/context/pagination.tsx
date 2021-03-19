import React, {FC, createContext, useState} from 'react'

interface PaginationContextType {
  offset: number // the start index
  size: number // the size of the page
  total: number // the total number of entries

  next: () => void
  previous: () => void

  setSize: (size: number) => void
}

const DEFAULT_CONTEXT: PaginationContextType = {
  offset: 0,
  size: 0,
  total: 0,

  next: () => {},
  previous: () => {},

  setSize: (_size: number) => {},
}

export const PaginationContext = createContext<PaginationContextType>(
  DEFAULT_CONTEXT
)

interface PaginationProviderProps {
  total?: number
}

export const PaginationProvider: FC<PaginationProviderProps> = ({
  total,
  children,
}) => {
  const [offset, setOffset] = useState(DEFAULT_CONTEXT.offset)
  const [size, setSize] = useState(DEFAULT_CONTEXT.size)

  const next = () => {
    if (total) {
      setOffset(Math.min(offset + size, total - size))
    } else {
      setOffset(offset + size)
    }
  }

  const previous = () => {
    setOffset(Math.max(offset - size, 0))
  }

  return (
    <PaginationContext.Provider
      value={{
        offset,
        size,
        total,
        next,
        previous,
        setSize,
      }}
    >
      {children}
    </PaginationContext.Provider>
  )
}
