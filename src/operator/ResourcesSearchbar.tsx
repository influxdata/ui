// Libraries
import React, {FC, useState, useCallback, ChangeEvent} from 'react'
import {Input, IconFont} from '@influxdata/clockface'
import _ from 'lodash'

interface Props {
  fetchData: (searchTerm?: string) => Promise<void>
  placeholder: string
  searchDebounce?: boolean
}

const ResourcesSearchbar: FC<Props> = ({
  fetchData,
  placeholder,
  searchDebounce = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  const debounceFun = searchDebounce
    ? useCallback(() => _.debounce(fetchData, 350), [fetchData])
    : fetchData

  const changeSearchTerm = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    debounceFun(e.target.value)
  }

  return (
    <Input
      icon={IconFont.Search}
      placeholder={placeholder}
      inputStyle={{width: '500px'}}
      value={searchTerm}
      onChange={changeSearchTerm}
      testID="searchbar"
    />
  )
}
export default ResourcesSearchbar
