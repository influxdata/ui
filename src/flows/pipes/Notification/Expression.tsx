// Libraries
import React, {FC, createRef} from 'react'

// Component
import {Button, ComponentSize, ComponentColor} from '@influxdata/clockface'

interface Props {
  expression: string
  onClickFunction: (expression: string) => void
  testID: string
}

const defaultProps = {
  testID: 'alert-expression',
}

const ToolbarExpression: FC<Props> = ({
  expression,
  onClickFunction,
  testID,
}) => {
  const handleClickFunction = () => {
    onClickFunction(expression)
  }

  return (
    <dd
      data-testid={testID}
      className="flux-toolbar--list-item flux-toolbar--function"
    >
      <code>{expression}</code>
      <Button
        testID={`flux--${testID}--inject`}
        text="Inject"
        onClick={handleClickFunction}
        size={ComponentSize.ExtraSmall}
        className="flux-toolbar--injector"
        color={ComponentColor.Primary}
      />
    </dd>
  )
}

ToolbarExpression.defaultProps = defaultProps

export default ToolbarExpression
