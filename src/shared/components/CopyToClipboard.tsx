// Libraries
import React, {FC, ChangeEvent} from 'react'
import copy from 'copy-to-clipboard'

interface Props {
  text: string
  onCopy: (copiedText: string, copyWasSuccessful: boolean) => void
  children?: JSX.Element
}

const CopyToClipboard: FC<Props> = ({text, onCopy, children, ...props}) => {
  const onClick = (event: ChangeEvent<HTMLInputElement>) => {
    const elem = React.Children.only(children)

    const result = copy(text)

    if (onCopy) {
      onCopy(text, result)
    }

    // Bypass onClick if it was present
    if (elem && elem.props && typeof elem.props.onClick === 'function') {
      elem.props.onClick(event)
    }
  }

  const elem = React.Children.only(children)

  return React.cloneElement(elem, {...props, onClick})
}

export default CopyToClipboard
