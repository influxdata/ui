// Libraries
import React, {FC} from 'react'

// Components
import TimeMachineFluxEditor from 'src/timeMachine/components/TimeMachineFluxEditor'
import SubmitCheckQueryButton from 'src/timeMachine/components/SubmitCheckQueryButton'
import RawDataToggle from 'src/timeMachine/components/RawDataToggle'
import QueryTabs from 'src/timeMachine/components/QueryTabs'
import {
  ComponentSize,
  FlexBox,
  FlexDirection,
  JustifyContent,
} from '@influxdata/clockface'
import {FeatureFlag} from 'src/shared/utils/featureFlag'
import ProfleQueryToggle from 'src/timeMachine/components/ProfileQueryToggle'

const TimeMachineCheckQuery: FC = () => {
  return (
    <div className="time-machine-queries">
      <div className="time-machine-queries--controls">
        <QueryTabs />
        <div className="time-machine-queries--buttons">
          <FlexBox
            direction={FlexDirection.Row}
            justifyContent={JustifyContent.FlexEnd}
            margin={ComponentSize.Small}
          >
            <FeatureFlag name="profile-query">
              <ProfleQueryToggle />
            </FeatureFlag>
            <RawDataToggle />
            <SubmitCheckQueryButton />
          </FlexBox>
        </div>
      </div>
      <div className="time-machine-queries--body">
        <TimeMachineFluxEditor />
      </div>
    </div>
  )
}

export default TimeMachineCheckQuery
