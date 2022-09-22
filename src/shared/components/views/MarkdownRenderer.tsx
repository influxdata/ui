// Libraries
import React, {FC, ReactNode} from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeExternalLinks from 'rehype-external-links'

import {CLOUD, MARKDOWN_UNSUPPORTED_IMAGE} from 'src/shared/constants/index'

interface Props {
  className?: string
  cloudRenderers?: ReactNode
  text: string
  escapeHtml?: boolean
}

interface ImageProps {
  src?: string
  alt?: string
}

// In cloud environments, we want to render the literal markdown image tag
// but ReactMarkdown expects a React element wrapping an image to be returned,
// so we use any
// see: https://github.com/rexxars/react-markdown/blob/master/index.d.ts#L101
const disallowedImageRenderer: any = (): any => MARKDOWN_UNSUPPORTED_IMAGE

// In OSS we want to allow users to render images to external sources, requiring
// this custom renderer.  If you want to disallow these, remove this renderer or
// change to the disallowedImageRenderer instead.
const allowedImageRenderer: FC<ImageProps> = ({src, alt}) => {
  return (
    <div>
      <img src={src} alt={alt} />
    </div>
  )
}

const rehypePlugins = [rehypeExternalLinks]

export const MarkdownRenderer: FC<Props> = ({className = '', text}) => {
  // don't parse images in cloud environments to prevent arbitrary script execution via images
  if (CLOUD) {
    return (
      <ReactMarkdown
        className={className}
        components={{img: disallowedImageRenderer}}
        linkTarget="_blank"
        rehypePlugins={rehypePlugins}
      >
        {text}
      </ReactMarkdown>
    )
  }

  // load images locally to your heart's content. caveat emptor
  return (
    <ReactMarkdown
      className={className}
      components={{img: allowedImageRenderer}}
      linkTarget="_blank"
    >
      {text}
    </ReactMarkdown>
  )
}
