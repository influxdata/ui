import React, {FC} from 'react'

interface OwnProps {
  value: string
}

const DeveloperCLIAutoCompleteItem: FC<OwnProps> = ({value}) => {
  return (
      <div className='developer-cli-ac-item'>
        {value}
      </div>
  )
}

export default DeveloperCLIAutoCompleteItem
