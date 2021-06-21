// Libraries
import React, {FC} from 'react'

// Components
import {ComponentSize, InfluxColors, TextBlock} from '@influxdata/clockface'

import {useSelector} from 'react-redux'
import {isAnnotationsModeEnabled} from 'src/annotations/selectors'
import Toolbar from 'src/shared/components/toolbar/Toolbar'
import {isFlagEnabled} from '../../../shared/utils/featureFlag'

export const AnnotationsControlBar: FC = () => {
  const rangeText = isFlagEnabled('rangeAnnotations')
    ? ', click + shift + drag to create a range annotation'
    : ''

  const infoText1 = `Shift + click on a graph to create a point annotation${rangeText}.`

  const infoText2 =
    'Press the annotations button again to turn off annotation mode'

  const showAnnotationBar = useSelector(isAnnotationsModeEnabled)

  if (!showAnnotationBar) {
    return null
  }
  // make both textblocks have 'inline' style to get them on the same line; else there is a line break.
  // using two elements to put space between them.
  return (
    <Toolbar
      testID="annotations-control-bar"
      margin={ComponentSize.Large}
      style={{justifyContent: 'center', padding: '0 32px', width: '100%'}}
    >
      <TextBlock
        backgroundColor={InfluxColors.Obsidian}
        textColor={InfluxColors.Mist}
        text={infoText1}
        style={{marginRight: 8, paddingRight: 0}}
      />
      <TextBlock
        backgroundColor={InfluxColors.Obsidian}
        textColor={InfluxColors.Mist}
        text={infoText2}
        style={{paddingLeft: 0}}
      />
    </Toolbar>
  )
}
