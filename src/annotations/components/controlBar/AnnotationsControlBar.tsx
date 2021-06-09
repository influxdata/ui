// Libraries
import React, {FC} from 'react'

// Components
import {
  ComponentSize,
  FlexBox,
  FlexBoxChild,
  InfluxColors,
  JustifyContent,
  TextBlock,
} from '@influxdata/clockface'

import {useSelector} from 'react-redux'
import {isAnnotationsModeEnabled} from '../../selectors'

export const AnnotationsControlBar: FC = () => {
  const infoText1 =
    'Click on a graph to create a point annotation, click + shift + drag to create a range annotation.'

  const infoText2 =
    'Press the annotations button again to turn off annotation mode'

  const showAnnotationBar = useSelector(isAnnotationsModeEnabled)

  if (!showAnnotationBar) {
    return null
  }
  // make both textblocks have 'inline' style to get them on the same line; else there is a line break.
  // using two elements to put space between them.
  return (
    <FlexBox
      testID="annotations-control-bar"
      justifyContent={JustifyContent.FlexStart}
      margin={ComponentSize.Large}
    >
      <FlexBoxChild grow={0}>
        <TextBlock
          backgroundColor={InfluxColors.Obsidian}
          textColor={InfluxColors.Mist}
          text={infoText1}
          style={{display: 'inline'}}
        />
        <TextBlock
          backgroundColor={InfluxColors.Obsidian}
          textColor={InfluxColors.Mist}
          text={infoText2}
          style={{display: 'inline'}}
        />
      </FlexBoxChild>
    </FlexBox>
  )
}
