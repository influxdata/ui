// Libraries
import React, {FC, ReactNode} from 'react'
import ReactMarkdown from 'react-markdown'

import {CLOUD, MARKDOWN_UNSUPPORTED_IMAGE} from 'src/shared/constants/index'

interface Props {
  className?: string
  cloudRenderers?: ReactNode
  text: string
  escapeHtml?: boolean
}

// In cloud environments, we want to render the literal markdown image tag
// but ReactMarkdown expects a React element wrapping an image to be returned,
// so we use any
// see: https://github.com/rexxars/react-markdown/blob/master/index.d.ts#L101
const imageRenderer: any = (): any => MARKDOWN_UNSUPPORTED_IMAGE

export const MarkdownRenderer: FC<Props> = ({className = '', text}) => {
  // don't parse images in cloud environments to prevent arbitrary script execution via images
  if (CLOUD) {
    return (
      <ReactMarkdown className={className} components={{img: imageRenderer}}>
        {text}
      </ReactMarkdown>
    )
  }

  // load images locally to your heart's content. caveat emptor
  return <ReactMarkdown className={className}>{text}</ReactMarkdown>
}
