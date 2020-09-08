// Libraries
import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'

import {AppState} from 'src/types'
import {getTemplateNameFromUrl} from 'src/templates/utils'
import {fetchAndSetReadme} from 'src/templates/actions/thunks'

interface OwnProps {
  url: string
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

const cloudImageRenderer = (): any =>
  "We don't support images in markdown for security purposes"

class CommunityTemplateReadmeUnconnected extends Component<Props> {
  componentDidMount = () => {
    if (!this.props.communityTemplateReadme) {
      this.props.fetchAndSetReadme(this.props.name, this.props.directory)
    }
  }

  render = () => {
    const {communityTemplateReadme} = this.props

    if (!communityTemplateReadme) {
      return null
    }

    return (
      <MarkdownRenderer
        text={communityTemplateReadme}
        className="markdown-format"
        cloudRenderers={{
          image: cloudImageRenderer,
          imageReference: cloudImageRenderer,
        }}
      />
    )
  }
}

const mstp = (state: AppState, props: any) => {
  const templateDetails = getTemplateNameFromUrl(props.url)
  return {
    directory: templateDetails.directory,
    name: templateDetails.name,
    communityTemplateReadme:
      state.resources.templates.communityTemplateReadme[templateDetails.name],
  }
}

const mdtp = {
  fetchAndSetReadme,
}

const connector = connect(mstp, mdtp)

export const CommunityTemplateReadme = connector(
  CommunityTemplateReadmeUnconnected
)
