// Libraries
import React, {FC, ChangeEvent, useContext} from 'react'

// Contexts
import {WriteDataSearchContext} from 'src/writeData/containers/WriteDataPage'

// Components
import {Input, InputRef, ComponentSize, IconFont} from '@influxdata/clockface'
import ClearButton from 'src/shared/components/search_widget/ClearButton'

const WriteDataSearchBar: FC = () => {
  const {searchTerm, setSearchTerm} = useContext(WriteDataSearchContext)
  const handleInputChange = (e: ChangeEvent<InputRef>): void => {
    setSearchTerm(e.target.value)
  }

  const clear = (): void => {
    setSearchTerm('')
  }

  return (
    <Input
      placeholder="Search data writing methods..."
      value={searchTerm}
      size={ComponentSize.Large}
      icon={IconFont.Search}
      onChange={handleInputChange}
      autoFocus={true}
      onClear={clear}
      clearBtnStyle={{fontSize: '2.4em', top: 1}}
    ></Input>
  )
}

export default WriteDataSearchBar
