import React, {FC, createElement} from 'react'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

import {
  VisualizationOptionProps,
  SUPPORTED_VISUALIZATIONS,
} from 'src/visualization'

const ViewOptions: FC<VisualizationOptionProps> = ({
  properties,
  results,
  update,
}) => {
  if (!SUPPORTED_VISUALIZATIONS[properties.type].options) {
    return
  }

  return (
    <ErrorBoundary>
      <div className="view-options">
        {createElement(SUPPORTED_VISUALIZATIONS[properties.type].options, {
          properties: properties,
          results,
          update: update,
        })}
      </div>
    </ErrorBoundary>
  )
}

export default ViewOptions
