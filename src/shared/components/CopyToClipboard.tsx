// Libraries
import React, {FC, ChangeEvent} from 'react'

export const copy = async (text: string): Promise<boolean> => {
  let result: boolean
  try {
    if (navigator.clipboard) {
      // All browsers except IE
      await navigator.clipboard.writeText(text)
    } else {
      // IE
      const successful = document.execCommand('copy')
      if (!successful) {
        throw new Error('Copy command was unsuccessful using execCommand')
      }
    }
    result = true
  } catch (err) {
    result = false
  }
  return result
}
interface Props {
  text: string
  children: JSX.Element
  onCopy?: (copiedText: string, copyWasSuccessful: boolean) => void
}

const CopyToClipboard: FC<Props> = ({text, children, onCopy, ...props}) => {
  const elem = React.Children.only(children)

  const onClick = async (event: ChangeEvent<HTMLInputElement>) => {
    const result = await copy(text)

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
