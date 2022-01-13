// Libraries
import React, {FunctionComponent} from 'react'

// Components
import {DapperScrollbars} from '@influxdata/clockface'
import TooltipDescription from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/TooltipDescription'
import TooltipArguments from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/TooltipArguments'
import TooltipLink from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/TooltipLink'

// Types
// import {FluxToolbarFunction} from 'src/types/shared'

interface Props {
  func: any
}

const FunctionTooltipContents: FunctionComponent<Props> = ({
  func: {description, fluxParameters},
}) => {
  return (
    <div className="flux-function-docs" data-testid={`flux-docs--${name}`}>
      <DapperScrollbars autoHide={false}>
        <div className="flux-toolbar--popover">
          <TooltipDescription description={description} />
          <TooltipArguments argsList={fluxParameters} />
          <TooltipLink link={'blah'} />
        </div>
      </DapperScrollbars>
    </div>
  )
}

export default FunctionTooltipContents
