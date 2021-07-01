import React, {FC, createContext, useState, useCallback} from 'react'
import {
  calcOffset,
  calcNextPageOffset,
  calcPrevPageOffset,
} from '../utils/paginationUtils'
interface PaginationContextType {
  offset: number // the start index
  size: number // the size of the page
  total: number // the total number of entries
  totalPages: number // the total number of pages

  next: () => void
  previous: () => void

  setSize: (size: number) => void
  setPage: (page: number) => void
  setTotalPages: (totalPages: number) => void
}

const DEFAULT_CONTEXT: PaginationContextType = {
  offset: 0,
  size: 0,
  total: 0,
  totalPages: 0,

  next: () => {},
  previous: () => {},

  setSize: (_size: number) => {},
  setPage: (_page: number) => {},
  setTotalPages: (_totalPages: number) => {},
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
  const [totalPages, setTotalPages] = useState(DEFAULT_CONTEXT.totalPages)

  const next = useCallback(() => {
    if (total) {
      setOffset(calcNextPageOffset(offset, size, total))
    } else {
      setOffset(offset + size)
    }
  }, [offset, size, setOffset])

  const previous = useCallback(() => {
    setOffset(calcPrevPageOffset(offset, size))
  }, [offset, size, setOffset])

  const setPage = useCallback(
    (page: number) => {
      setOffset(calcOffset(page, size, total))
    },
    [offset, size, setOffset]
  )

  return (
    <PaginationContext.Provider
      value={{
        offset,
        size,
        total,
        totalPages,
        next,
        previous,
        setSize,
        setPage,
        setTotalPages,
      }}
    >
      {children}
    </PaginationContext.Provider>
  )
}
