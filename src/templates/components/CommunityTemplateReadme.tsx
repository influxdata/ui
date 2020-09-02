// Libraries
import React, {PureComponent} from 'react'
import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'

interface Props {
  readMeData: string
}

const cloudImageRenderer = (): any =>
  "We don't support images in markdown for security purposes"

export class CommunityTemplateReadme extends PureComponent<Props> {
  render = () => {
    return (
      <MarkdownRenderer
        text={this.props.readMeData}
        className="markdown-format"
        cloudRenderers={{
          image: cloudImageRenderer,
          imageReference: cloudImageRenderer,
        }}
      />
    )
  }
}
