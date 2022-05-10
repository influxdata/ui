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

import 'src/homepageExperience/components/HomepageExperience.scss'

type OwnProps = {
  wizardEventName: string
  selectedFeedback: number
  onFeedbackSelection: (feedbackValue: number) => void
}

enum feedbackValue {
  THUMBS_DOWN,
  THUMBS_UP,
}

const USERPILOT_FEEDBACK_ID = '1650913576rUrz8532'

export default class FeedbackBar extends React.Component<OwnProps> {
  constructor(props) {
    super(props)
  }

  // for now, we're only registering the first feedback user selects.
  private handleThumbsUpClick = () => {
    if (this.props.selectedFeedback === null) {
      event(`firstMile.${this.props.wizardEventName}.thumbsUp.clicked`)
      this.props.onFeedbackSelection(feedbackValue.THUMBS_UP)

      if (window.userpilot) {
        window.userpilot.trigger(USERPILOT_FEEDBACK_ID)
      }
    }
  }
  private handleThumbsDownClick = () => {
    if (this.props.selectedFeedback === null) {
      event(`firstMile.${this.props.wizardEventName}.thumbsDown.clicked`)
      this.props.onFeedbackSelection(feedbackValue.THUMBS_DOWN)

      if (window.userpilot) {
        window.userpilot.trigger(USERPILOT_FEEDBACK_ID)
      }
    }
  }

  render() {
    const {selectedFeedback} = this.props
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
