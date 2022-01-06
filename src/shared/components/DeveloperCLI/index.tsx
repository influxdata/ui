import React, {FC} from 'react'
import DeveloperCLIAutoComplete from './AutoComplete'
import 'src/shared/components/DeveloperCLI/index.scss'
import DeveloperCLIInput from './Input'
import {DeveloperCLIProvider} from './context'

const DeveloperCLI: FC = () => {
  // const {autocompleteItems} = useContext(DeveloperCLIContext)
  return (
    <DeveloperCLIProvider>
      <div className="developer-cli">
        <DeveloperCLIAutoComplete />
        <DeveloperCLIInput />
      </div>
    </DeveloperCLIProvider>
  )
}

export default DeveloperCLI
