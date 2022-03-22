// Libraries
import React, {FunctionComponent} from 'react'

// Components
import {DapperScrollbars} from '@influxdata/clockface'
import TooltipArguments from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/TooltipArguments'
import TooltipDescription from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/TooltipDescription'
import TooltipLink from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/TooltipLink'

// Types
import {Fluxdocs} from 'src/client/fluxdocsdRoutes'

// Utils
import {event} from 'src/cloud/utils/reporting'
interface Props {
  func: Fluxdocs
}

const FunctionTooltipContents: FunctionComponent<Props> = ({
  func: {headline, fluxParameters, name},
}) => {
  event('Flux function tooltip overlay opened')
  return (
    <div className="flux-function-docs" data-testid={`flux-docs--${name}`}>
      <DapperScrollbars autoHide={false}>
        <div className="flux-toolbar--popover">
          <TooltipDescription description={headline} />
          <TooltipArguments argsList={fluxParameters} />
          <TooltipLink />
        </div>
      </DapperScrollbars>
    </div>
  )
}
export default FunctionTooltipContents
