import {ComponentStatus, Input} from '@influxdata/clockface'
import React, {FC, useContext} from 'react'
import {DeveloperCLIContext} from './context'

const DeveloperCLIInput: FC = () => {
  const {term, setSearchTerm} = useContext(DeveloperCLIContext)
  return (
    <Input
      placeholder="enter command..."
      value={term}
      status={ComponentStatus.Default}
      autoFocus={true}
      onChange={e => setSearchTerm(e.target.value)}
      //   onKeyPress={evt => {
      //     if (evt.key === 'Enter') {
      //       setIsFocused(false)
      //     }
      //   }}
      testID="developer-cli"
      className="developer-cli-input"
    />
  )
}

export default DeveloperCLIInput
