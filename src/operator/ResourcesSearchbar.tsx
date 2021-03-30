// Libraries
import React, {FC, useContext, ChangeEvent} from 'react'
import {Input, IconFont} from '@influxdata/clockface'
import {OperatorContext} from 'src/operator/context/operator'

// Types
import {OperatorRoutes} from 'src/operator/constants'

const ResourcesSearchbar: FC = () => {
  const {pathname, searchTerm, setSearchTerm} = useContext(OperatorContext)

  const changeSearchTerm = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const isOrgsTab = pathname.includes(OperatorRoutes.organizations)
    ? 'organizations'
    : 'accounts'

  return (
    <Input
      icon={IconFont.Search}
      placeholder={`Filter ${isOrgsTab} by ${
        isOrgsTab === 'organizations' ? 'id' : 'email'
      } ...`}
      inputStyle={{width: '500px'}}
      value={searchTerm}
      onChange={changeSearchTerm}
      testID="searchbar"
    />
  )
}
export default ResourcesSearchbar
