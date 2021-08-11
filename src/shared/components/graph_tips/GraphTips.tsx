// Libraries
import React, {FC} from 'react'

// Components
import {ComponentColor, QuestionMarkTooltip} from '@influxdata/clockface'

const GraphTips: FC = () => (
  <QuestionMarkTooltip
    diameter={18}
    color={ComponentColor.Primary}
    testID="graphtips-question-mark"
    tooltipContents={
      <>
        <h5>Graph Tips:</h5>
        <div>
          <div className="graph-tips-line">
            <code>Click + Drag</code> <span>Zoom in (X or Y)</span>
          </div>
          <div className="graph-tips-line">
            <code>Double Click</code> <span>Reset Graph Window</span>
          </div>
          <br />
          <span>When Annotations button is on:</span>
          <div className="graph-tips-line">
            <code>Shift + Click</code> <span> Annotate a point on a graph</span>
          </div>
          <div className="graph-tips-line">
            <code>Shift + Drag</code> <span> Annotate a range on a graph </span>
          </div>
        </div>
      </>
    }
  />
)

export default GraphTips
