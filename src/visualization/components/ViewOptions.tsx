import React, {FC, createElement} from 'react'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

import {VisOptionProps, TYPE_DEFINITIONS} from 'src/visualization'

const ViewOptions: FC<VisOptionProps> = ({properties, results, update}) => {
  if (!TYPE_DEFINITIONS[properties.type].options) {
    return
  }

  return (
    <ErrorBoundary>
      <div className="view-options">
        {createElement(TYPE_DEFINITIONS[properties.type].options, {
          properties: properties,
          results,
          update: update,
        })}
      </div>
    </ErrorBoundary>
  )
}

export default ViewOptions
