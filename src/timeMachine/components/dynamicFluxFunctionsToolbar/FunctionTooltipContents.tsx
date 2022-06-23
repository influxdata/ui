// Libraries
import React, {FunctionComponent, useEffect} from 'react'

// Components
import {DapperScrollbars} from '@influxdata/clockface'
import TooltipArguments from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/TooltipArguments'
import TooltipDescription from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/TooltipDescription'
import TooltipLink from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/TooltipLink'

// Types
import {Fluxdocs} from 'src/client/fluxdocsdRoutes'
interface Props {
  func: Fluxdocs
  setToolTipPopup?: (boolean: boolean) => void
  setHoverdFunction?: (string: string) => void
}

const FunctionTooltipContents: FunctionComponent<Props> = ({
  func: {headline, fluxParameters, name, package: packageName},
  setToolTipPopup,
  setHoverdFunction,
}) => {
  useEffect(() => {
    setToolTipPopup(true)
    setHoverdFunction(`${packageName}.${name}`)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
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
