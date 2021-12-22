import React, {FC} from 'react'
import DeveloperCLIAutoCompleteItem from './Item'

interface OwnProps {
  items?: string[]
}

const DeveloperCLIAutoComplete: FC<OwnProps> = ({items=[]}) => {
  console.log('itemssss', items)
  return (
      <div className='developer-cli-ac'>
        {items.map((item) => <DeveloperCLIAutoCompleteItem value={item} />)} 
      </div>
  )
}

export default DeveloperCLIAutoComplete
