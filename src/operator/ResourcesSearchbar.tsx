// Libraries
import React, {ChangeEvent, FC, useContext, useState, useRef} from 'react'
import {Input, IconFont} from '@influxdata/clockface'
import {OperatorContext} from 'src/operator/context/operator'
import {debounce} from 'lodash'

// Types
import {OperatorRoutes} from 'src/operator/constants'

const ResourcesSearchbar: FC = () => {
  const {pathname, setSearchTerm} = useContext(OperatorContext)
  const [searchText, setSearchText] = useState('')

  const debounceFunc = useRef(debounce(setSearchTerm, 300))

  const changeSearchTerm = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
    debounceFunc.current(event.target.value)
  }

  const isOrgsTab = pathname.includes(OperatorRoutes.organizations)
    ? 'organizations'
    : 'accounts'

  return (
    <Input
      icon={IconFont.Search_New}
      placeholder={`Filter ${isOrgsTab} by ${
        isOrgsTab === 'organizations' ? 'id' : 'email'
      } ...`}
      inputStyle={{width: '500px'}}
      value={searchText}
      onChange={changeSearchTerm}
      testID="operator-resource--searchbar"
    />
  )
}
export default ResourcesSearchbar
