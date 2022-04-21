import React from 'react'
import {
  ComponentSize,
  FlexBox,
  InfluxColors,
  JustifyContent,
} from '@influxdata/clockface'
import {
  ThumbsDown,
  ThumbsUp,
} from 'src/homepageExperience/components/HomepageIcons'
import {event} from 'src/cloud/utils/reporting'

import 'src/homepageExperience/HomepageExperience.scss'

type OwnProps = {
  wizardEventName: string
}
type State = {
  selectedFeedback: number
}

enum feedbackValue {
  THUMBS_DOWN,
  THUMBS_UP,
}

export default class FeedbackBar extends React.Component<OwnProps, State> {
  constructor(props) {
    super(props)
    this.state = {
      selectedFeedback: null,
    }
  }

  private handleThumbsUpClick = () => {
    event(`firstMile.${this.props.wizardEventName}.thumbsUp.clicked`)
    this.setState({selectedFeedback: feedbackValue.THUMBS_UP})
  }
  private handleThumbsDownClick = () => {
    event(`firstMile.${this.props.wizardEventName}.thumbsDown.clicked`)
    this.setState({selectedFeedback: feedbackValue.THUMBS_DOWN})
  }

  render() {
    const {selectedFeedback} = this.state
    return (
      <FlexBox
        margin={ComponentSize.Large}
        justifyContent={JustifyContent.SpaceBetween}
        className="feedback-bar"
      >
        <p>What did you think about the set up process?</p>
        <FlexBox margin={ComponentSize.Large}>
          <button
            onClick={this.handleThumbsUpClick}
            style={{
              fill:
                selectedFeedback === feedbackValue.THUMBS_UP
                  ? InfluxColors.Rainforest
                  : InfluxColors.White,
            }}
          >
            {ThumbsUp}
          </button>
          <button
            onClick={this.handleThumbsDownClick}
            style={{
              fill:
                selectedFeedback === feedbackValue.THUMBS_DOWN
                  ? InfluxColors.Fire
                  : InfluxColors.White,
            }}
          >
            {ThumbsDown}
          </button>
        </FlexBox>
      </FlexBox>
    )
  }
}
