// Libraries
import React, {FC} from 'react'

// Components
import AddButtons from 'src/flows/components/AddButtons'

// Styles
import 'src/flows/components/EmptyPipeList.scss'
import {PROJECT_NAME_PLURAL} from 'src/flows'

const EmptyPipeList: FC = () => {
  return (
    <div className="flow-empty">
      <div className="flow-empty--graphic" />
      <h3>Welcome to {PROJECT_NAME_PLURAL}</h3>
      <p>
        This is a more flexible way to explore, visualize, and (eventually)
        alert on your data
      </p>
      <p>
        Get started by <strong>Adding a Cell</strong> below
      </p>
      <div className="flow-empty--buttons">
        <AddButtons />
      </div>
    </div>
  )
}

export default EmptyPipeList
