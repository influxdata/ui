import React, {FC, useContext} from 'react'
import {DeveloperCLIContext} from '../context'
import DeveloperCLIAutoCompleteItem from './Item'

const DeveloperCLIAutoComplete: FC = () => {
  const {items} = useContext(DeveloperCLIContext)
  return (
    <div className="developer-cli-ac">
      {items.map((item, i) => (
        <DeveloperCLIAutoCompleteItem key={i} item={item} />
      ))}
    </div>
  )
}

export default DeveloperCLIAutoComplete
