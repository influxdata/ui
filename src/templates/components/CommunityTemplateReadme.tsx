// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'
import {fetchReadMe} from 'src/templates/api'
import {reportError} from 'src/shared/utils/errors'
import {AppState} from 'src/types'
import {getTemplateNameFromUrl} from 'src/templates/utils'

interface OwnProps {
  url: string
}

type ReduxProps = ConnectedProps<typeof connector>

type Props = OwnProps & ReduxProps


const cloudImageRenderer = (): any =>
  "We don't support images in markdown for security purposes"

class CommunityTemplateReadmeUnconnected extends PureComponent<Props> {
  state = {readMeData: ''}
  directory = getTemplateNameFromUrl(this.props.url).directory
  name = getTemplateNameFromUrl(this.props.url).name

  componentDidMount = async () => {
    console.log(this.props.communityTemplateReadme)

    try {
      const response = await fetchReadMe(this.directory)
      this.setState({readMeData: response})
    } catch (error) {
      reportError(error, {
        name: 'The community template fetch github readme failed',
      })

      this.setState({
        readMeData: "## We can't find the readme associated with this template",
      })
    }
  }

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


const mstp = (state: AppState) => {
  return {
    communityTemplateReadme: state.resources.templates.communityTemplateReadme
  }
}

const mdtp = {

}

const connector = connect(mstp, mdtp)

export const CommunityTemplateReadme = connector(
  CommunityTemplateReadmeUnconnected
)
