// Libraries
import React, {FC} from 'react'
const marked = require('marked')

import {CLOUD} from 'src/shared/constants/index'

interface Props {
  className?: string
  cloudRenderers?: any
  text: string
}

// In cloud environments, we want to render the literal markdown image tag
// but marked JS expects a React element wrapping an image to be returned,
// so we use return literal image string for renderer
// see: https://marked.js.org/using_pro#renderer

export const MarkdownRenderer: FC<Props> = ({
  className = '',
  cloudRenderers = {},
  text,
}) => {
  // don't parse images in cloud environments to prevent arbitrary script execution via images
  if (CLOUD) {
    const renderer = {
      html(html) {
        if (html.includes('<img')) {
          if (cloudRenderers?.image) {
            return cloudRenderers.image
          }
          const url = html.match(/"([^"]+)"/)[0]
          return `![](${url})`
        }
        return html
      },
      image(href) {
        if (cloudRenderers?.image) {
          return cloudRenderers.image
        }
        return `![](${href})`
      },
    }

    marked.use({renderer})

    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{
          __html: marked(text),
        }}
      ></div>
    )
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{
        __html: marked(text),
      }}
    ></div>
  )
}
