// Libraries
import React, {FC} from 'react'

// Component
import {DapperScrollbars} from '@influxdata/clockface'

// Types
import {FluxToolbarFunction} from 'src/types/shared'

interface TooltipProps {
  item: FluxToolbarFunction
}

const FunctionTooltipContent: FC<TooltipProps> = ({item: func}) => {
  let argComponent = <div className="flux-function-docs--arguments">None</div>

  if (func.args.length > 0) {
    argComponent = (
      <>
        {func.args.map(a => (
          <div className="flux-function-docs--arguments" key={a.name}>
            <span>{a.name}:</span>
            <span>{a.type}</span>
            <div>{a.desc}</div>
          </div>
        ))}
      </>
    )
  }

  return (
    <div className="flux-function-docs" data-testid={`flux-docs--${func.name}`}>
      <DapperScrollbars autoHide={false}>
        <div className="flux-toolbar--popover">
          <article className="flux-functions-toolbar--description">
            <div className="flux-function-docs--heading">Description</div>
            <span>{func.desc}</span>
          </article>
          <article>
            <div className="flux-function-docs--heading">Arguments</div>
            <div className="flux-function-docs--snippet">{argComponent}</div>
          </article>
          <article>
            <div className="flux-function-docs--heading">Example</div>
            <div className="flux-function-docs--snippet">{func.example}</div>
          </article>
          <p className="tooltip--link">
            Still have questions? Check out the{' '}
            <a target="_blank" rel="noreferrer" href={func.link}>
              Flux Docs
            </a>
            .
          </p>
        </div>
      </DapperScrollbars>
    </div>
  )
}

export default FunctionTooltipContent
