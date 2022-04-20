import React from 'react'
import {ComponentSize, FlexBox, JustifyContent} from '@influxdata/clockface'
import {ThumbsDown, ThumbsUp} from './HomepageIcons'

type OwnProps = {
  wizardEventName: string
}
export default class FeedbackBar extends React.Component<OwnProps> {
  private handleThumbsUpClick = () => {
    // handle event here
  }
  private handleThumbsDownClick = () => {
    // handle event here
  }
  render() {
    const feedbackBarStyle = {
      background:
        'linear-gradient(256.11deg, rgba(147, 148, 255, 0.2) 0%, rgba(81, 60, 198, 0.2) 100%)',
      paddingLeft: '16px',
      paddingRight: '16px',
      maxWidth: '493px',
    }

    return (
      <FlexBox
        style={feedbackBarStyle}
        margin={ComponentSize.Large}
        justifyContent={JustifyContent.SpaceBetween}
      >
        <p>What did you think about the set up process?</p>
        <FlexBox margin={ComponentSize.Large}>
          <button onClick={this.handleThumbsUpClick}>{ThumbsUp}</button>
          <button onClick={this.handleThumbsDownClick}>{ThumbsDown}</button>
        </FlexBox>
      </FlexBox>
    )
  }
}
