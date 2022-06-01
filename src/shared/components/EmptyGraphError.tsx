// Libraries
import React, {useState, FunctionComponent} from 'react'

// Components
import {
  Button,
  ComponentSize,
  ComponentColor,
  Icon,
  IconFont,
  DapperScrollbars,
} from '@influxdata/clockface'
import CopyToClipboard from 'src/shared/components/CopyToClipboard'

interface Props {
  message: string
  testID?: string
}

const EmptyGraphError: FunctionComponent<Props> = ({message, testID}) => {
  const [didCopy, setDidCopy] = useState(false)

  const buttonText = didCopy ? 'Copied!' : 'Copy'
  const buttonColor = didCopy ? ComponentColor.Success : ComponentColor.Default

  const onClick = () => {
    setDidCopy(true)
    setTimeout(() => setDidCopy(false), 2000)
  }

  return (
    <div className="cell--view-empty" data-testid={testID}>
      <div className="empty-graph-error" data-testid="empty-graph-error">
        <DapperScrollbars className="empty-graph-error--scroll" autoHide={true}>
          <pre>
            <Icon glyph={IconFont.AlertTriangle} />
            <code className="cell--error-message"> {message}</code>
          </pre>
        </DapperScrollbars>
        <CopyToClipboard text={message}>
          <Button
            size={ComponentSize.ExtraSmall}
            color={buttonColor}
            titleText={buttonText}
            text={buttonText}
            onClick={onClick}
            className="empty-graph-error--copy"
          />
        </CopyToClipboard>
      </div>
    </div>
  )
}

export default EmptyGraphError
