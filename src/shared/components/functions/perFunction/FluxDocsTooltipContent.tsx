// Libraries
import React, {FC, useEffect} from 'react'
import classnames from 'classnames'

// Component
import {DapperScrollbars} from '@influxdata/clockface'

// Types
import {Fluxdocs} from 'src/client/fluxdocsdRoutes'

interface TooltipProps {
  item: Fluxdocs
  setToolTipPopup?: (boolean: boolean) => void
  setHoverdFunction?: (string: string) => void
}

const FluxDocsTooltipContent: FC<TooltipProps> = ({
  item: func,
  setToolTipPopup,
  setHoverdFunction,
}) => {
  useEffect(() => {
    setToolTipPopup && setToolTipPopup(true)
    setHoverdFunction && setHoverdFunction(`${func.package}.${func.name}`)
  }, [])
  const argComponent = () => {
    if (func.fluxParameters.length > 0) {
      return func.fluxParameters.map(arg => {
        let param = 'Optional'
        const description = arg.headline.slice(arg.name.length + 1)
        arg.required ? (param = 'Required') : param

        const paramClass = classnames('param', {
          isRequired: param === 'Required' ? true : false,
        })
        return (
          <div className="flux-function-docs--arguments" key={arg.name}>
            <span>{arg.name}:</span>
            <span className={paramClass}>({param})</span>
            <div>{description}</div>
          </div>
        )
      })
    }

    return <div className="flux-function-docs--arguments">None</div>
  }

  return (
    <div className="flux-function-docs" data-testid={`flux-docs--${func.name}`}>
      <DapperScrollbars autoHide={false}>
        <div className="flux-toolbar--popover">
          <article className="flux-functions-toolbar--description">
            <div className="flux-function-docs--heading">Description</div>
            <span>{func.headline}</span>
          </article>
          <article>
            <div className="flux-function-docs--heading">Arguments</div>
            <div className="flux-function-docs--snippet">{argComponent()}</div>
          </article>
          <p className="tooltip--link">
            Still have questions? Check out the{' '}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://docs.influxdata.com/flux/v0.x/stdlib/"
            >
              Flux Docs
            </a>
            .
          </p>
        </div>
      </DapperScrollbars>
    </div>
  )
}

export default FluxDocsTooltipContent
