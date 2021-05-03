// Libraries
import React, {PureComponent, MouseEvent} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'

// Components
import {
  Button,
  ComponentColor,
  ComponentSize,
  ButtonShape,
} from '@influxdata/clockface'

interface Props {
  text: string
  size?: ComponentSize
  onCopy?: () => void
}

class CopyButton extends PureComponent<Props> {
  public render() {
    const {text, size} = this.props
    return (
      <CopyToClipboard text={text} onCopy={this.handleCopyAttempt}>
        <Button
          shape={ButtonShape.Default}
          size={size || ComponentSize.ExtraSmall}
          color={ComponentColor.Secondary}
          titleText="Copy to Clipboard"
          text={text}
          onClick={this.handleClickCopy}
          testID="button-copy"
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
