// Libraries
import React, {FunctionComponent} from 'react'

// Components
import {
  FlexBox,
  FlexDirection,
  ComponentSize,
} from '@influxdata/clockface'
import BuilderCard from 'src/timeMachine/components/builderCard/BuilderCard'
import FillValues from 'src/timeMachine/components/FillValues'
import WindowPeriod from 'src/timeMachine/components/WindowPeriod'
import FunctionModeSelector from 'src/timeMachine/components/FunctionModeSelector'

const AggregationSelector: FunctionComponent = () => {
  return (
    <BuilderCard className="aggregation-selector" testID="aggregation-selector">
      <BuilderCard.Header
        title="Window Period"
        className="aggregation-selector-header"
      />
      <BuilderCard.Body
        scrollable={false}
        addPadding={false}
        className="aggregation-selector-body"
      >
        <WindowPeriod />
        <FlexBox
          direction={FlexDirection.Row}
          margin={ComponentSize.ExtraSmall}
          stretchToFitWidth
        >
          <FillValues />
        </FlexBox>
      </BuilderCard.Body>
      <FunctionModeSelector />
    </BuilderCard>
  )
}

export default AggregationSelector
