// Libraries
import React, {FC} from 'react'

// Components
import {ComponentColor, QuestionMarkTooltip} from '@influxdata/clockface'
import {FeatureFlag} from '../../utils/featureFlag'

const GraphTips: FC = () => (
  <QuestionMarkTooltip
    diameter={18}
    color={ComponentColor.Primary}
    testID="graphtips-question-mark"
    tooltipContents={
      <>
        <h1>Graph Tips:</h1>
        <p>
          <code>Click + Drag</code> Zoom in (X or Y)
          <br />
          <code>Double Click</code> Reset Graph Window
          <br />
          <FeatureFlag name="annotations">
            <code>Single Click</code> Annotate the Graph
          </FeatureFlag>
        </p>
      </>
    }
  />
)

export default GraphTips
