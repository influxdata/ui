// Libraries
import React, {FC, useContext, ChangeEvent} from 'react'
import {Input, IconFont} from '@influxdata/clockface'
import {OperatorContext} from 'src/operator/context/operator'

const ResourcesSearchbar: FC = () => {
  const {activeTab, searchTerm, setSearchTerm} = useContext(OperatorContext)

  const changeSearchTerm = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  return (
    <Input
      icon={IconFont.Search}
      placeholder={`Filter ${activeTab} by ${
        activeTab === 'accounts' ? 'email' : 'id'
      } ...`}
      inputStyle={{width: '500px'}}
      value={searchTerm}
      onChange={changeSearchTerm}
      testID="searchbar"
    />
  )
}
export default ResourcesSearchbar
