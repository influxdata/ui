// Libraries
import React, {PureComponent, MouseEvent} from 'react'

// Components
import {
  Button,
  ComponentColor,
  ComponentSize,
  ButtonShape,
} from '@influxdata/clockface'
import CopyToClipboard from 'src/shared/components/CopyToClipboard'

interface Props {
  text: string
  size?: ComponentSize
  testID?: string
  onCopy?: () => void
}

class CopyButton extends PureComponent<Props> {
  public render() {
    const {text, testID, size} = this.props
    return (
      <CopyToClipboard text={text} onCopy={this.handleCopyAttempt}>
        <Button
          shape={ButtonShape.Default}
          size={size || ComponentSize.ExtraSmall}
          color={ComponentColor.Secondary}
          titleText="Copy to Clipboard"
          text="Copy to Clipboard"
          onClick={this.handleClickCopy}
          testID={testID ?? 'button-copy'}
        />
      </CopyToClipboard>
    )
  }
  private handleClickCopy = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
  }

  private handleCopyAttempt = (): void => {
    const {onCopy} = this.props

    if (onCopy) {
      onCopy()
      return
    }
  }
}

export default CopyButton
