// Libraries
import React, {FC} from 'react'
import ReactMarkdown, {Renderer, Renderers} from 'react-markdown'
import htmlParser from 'react-markdown/plugins/html-parser.js'
import HtmlToReact from 'html-to-react'

import {CLOUD, MARKDOWN_UNSUPPORTED_IMAGE} from 'src/shared/constants/index'

interface Props {
  className?: string
  cloudRenderers?: Renderers
  text: string
}

// In cloud environments, we want to render the literal markdown image tag
// but ReactMarkdown expects a React element wrapping an image to be returned,
// so we use any
// see: https://github.com/rexxars/react-markdown/blob/master/index.d.ts#L101
const imageRenderer: Renderer<HTMLImageElement> = (): any =>
  MARKDOWN_UNSUPPORTED_IMAGE

// In cloud environments we don't want to render <img> or <script> tags.
// This parser ignores <script> tags and replaces <img> tags with text
// before the markdown is rendered via React-Markdown
// https://github.com/remarkjs/react-markdown#appendix-a-html-in-markdown
const processNodeDefinitions = new HtmlToReact.ProcessNodeDefinitions(React)
const parseHtml = htmlParser({
  isValidNode: node => node.type !== 'script',
  processingInstructions: [
    {
      replaceChildren: false,
      shouldProcessNode: node => node.name === 'img',
      processNode: () => {
        return (
          <p data-testid="markdown-image-unsupported">
            {MARKDOWN_UNSUPPORTED_IMAGE}
          </p>
        )
      },
    },
    {
      replaceChildren: false,
      shouldProcessNode: () => true,
      processNode: processNodeDefinitions.processDefaultNode,
    },
  ],
})

export const MarkdownRenderer: FC<Props> = ({
  className = '',
  cloudRenderers = {},
  text,
}) => {
  // don't parse images in cloud environments to prevent arbitrary script execution via images
  if (CLOUD) {
    const renderers = {image: imageRenderer, imageReference: imageRenderer}
    return (
      <ReactMarkdown
        source={text}
        className={className}
        renderers={{...renderers, ...cloudRenderers}}
        astPlugins={[parseHtml]}
        escapeHtml={false}
      />
    )
  }

  // load images locally to your heart's content. caveat emptor
  return (
    <ReactMarkdown source={text} className={className} escapeHtml={false} />
  )
}
