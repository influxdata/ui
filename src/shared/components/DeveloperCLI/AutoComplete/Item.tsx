import React, {FC} from 'react'
import {DeveloperCLIAutoCompleteItem} from '../context'

interface OwnProps {
  item: DeveloperCLIAutoCompleteItem
}

const DeveloperCLIAutoCompleteItem: FC<OwnProps> = ({item}) => {
  return (
    <div
      id={item.id}
      className="developer-cli-ac-item"
      onClick={item.cbClick ?? undefined}
    >
      {item.title}
    </div>
  )
}

export default DeveloperCLIAutoCompleteItem
