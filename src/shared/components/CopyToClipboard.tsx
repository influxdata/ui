// Libraries
import React, {FC, ChangeEvent} from 'react'
import copy from 'copy-to-clipboard'

interface Props {
  text: string
  children: JSX.Element
  onCopy?: (copiedText: string, copyWasSuccessful: boolean) => void
}

const CopyToClipboard: FC<Props> = ({text, children, onCopy, ...props}) => {
  const elem = React.Children.only(children)

  const onClick = (event: ChangeEvent<HTMLInputElement>) => {
    const result = copy(text)

    if (onCopy) {
      onCopy(text, result)
    }

    // Bypass onClick if it was present
    if (elem && elem.props && typeof elem.props.onClick === 'function') {
      elem.props.onClick(event)
    }
  }

  return React.cloneElement(elem, {...props, onClick})
}

export default CopyToClipboard
