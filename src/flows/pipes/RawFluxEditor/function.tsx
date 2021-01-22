// Libraries
import React, {FC, createRef} from 'react'

// Component
import {
  Popover,
  PopoverPosition,
  PopoverInteraction,
  Appearance,
  Button,
  ComponentSize,
  ComponentColor,
  DapperScrollbars,
} from '@influxdata/clockface'

// Types
import {FluxToolbarFunction} from 'src/types/shared'

interface Props {
  func: FluxToolbarFunction
  onClickFunction: (func: FluxToolbarFunction) => void
  testID: string
}

const defaultProps = {
  testID: 'flux-function',
}

const FunctionTooltipContents: FunctionComponent<Props> = ({
  func: {desc, args, example, link, name},
}) => {
  let _args = <div className="flux-function-docs--arguments">None</div>

  if (args.length > 0) {
    _args = args.map(a => (
      <div className="flux-function-docs--arguments" key={a.name}>
        <span>{a.name}:</span>
        <span>{a.type}</span>
        <div>{a.desc}</div>
      </div>
    ))
  }

  return (
    <div className="flux-function-docs" data-testid={`flux-docs--${name}`}>
      <DapperScrollbars autoHide={false}>
        <div className="flux-toolbar--popover">
          <article className="flux-functions-toolbar--description">
            <div className="flux-function-docs--heading">Description</div>
            <span>{desc}</span>
          </article>
          <article>
            <div className="flux-function-docs--heading">Arguments</div>
            <div className="flux-function-docs--snippet">{_args}</div>
          </article>
          <article>
            <div className="flux-function-docs--heading">Example</div>
            <div className="flux-function-docs--snippet">{example}</div>
          </article>
          <p className="tooltip--link">
            Still have questions? Check out the{' '}
            <a target="_blank" href={link}>
              Flux Docs
            </a>
            .
          </p>
        </div>
      </DapperScrollbars>
    </div>
  )
}

const ToolbarFunction: FC<Props> = ({func, onClickFunction, testID}) => {
  const functionRef = createRef<HTMLDListElement>()
  const handleClickFunction = () => {
    onClickFunction(func)
  }
  return (
    <>
      <Popover
        appearance={Appearance.Outline}
        enableDefaultStyles={false}
        position={PopoverPosition.ToTheLeft}
        triggerRef={functionRef}
        showEvent={PopoverInteraction.Hover}
        hideEvent={PopoverInteraction.Hover}
        distanceFromTrigger={8}
        testID="toolbar-popover"
        contents={() => <FunctionTooltipContents func={func} />}
      />
      <dd
        ref={functionRef}
        data-testid={`flux--${testID}`}
        className="flux-toolbar--list-item flux-toolbar--function"
      >
        <code>{func.name}</code>
        <Button
          testID={`flux--${testID}--inject`}
          text="Inject"
          onClick={handleClickFunction}
          size={ComponentSize.ExtraSmall}
          className="flux-toolbar--injector"
          color={ComponentColor.Primary}
        />
      </dd>
    </>
  )
}

ToolbarFunction.defaultProps = defaultProps

export default ToolbarFunction
