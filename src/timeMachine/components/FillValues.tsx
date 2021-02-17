// Libraries
import React, {FunctionComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  AlignItems,
  ComponentColor,
  ComponentSize,
  FlexBox,
  FlexDirection,
  InputLabel,
  InputToggleType,
  QuestionMarkTooltip,
  Toggle,
} from '@influxdata/clockface'

// Actions
import {setAggregateFillValues} from 'src/timeMachine/actions/queryBuilder'

// Utils
import {getActiveQuery, getIsInCheckOverlay} from 'src/timeMachine/selectors'

// Types
import {AppState} from 'src/types'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

const FillValues: FunctionComponent<Props> = ({
  fillValues,
  onSetAggregateFillValues,
  isInCheckOverlay,
}) => {
  const onChangeFillValues = () => {
    onSetAggregateFillValues(!fillValues)
  }
  if (isInCheckOverlay) {
    return <></>
  }

  return (
    <FlexBox
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      alignItems={AlignItems.FlexStart}
    >
      <Toggle
        id="isFillValues"
        type={InputToggleType.Checkbox}
        checked={fillValues}
        onChange={onChangeFillValues}
        color={ComponentColor.Primary}
        size={ComponentSize.ExtraSmall}
      >
        <InputLabel className="fill-values-checkbox--label">
          Fill missing values
        </InputLabel>
        <QuestionMarkTooltip
          style={{marginLeft: 6}}
          diameter={16}
          tooltipContents="For windows without data, create an empty window and fill it with a null aggregate value"
          tooltipStyle={{fontSize: '13px', padding: '8px'}}
        />
      </Toggle>
    </FlexBox>
  )
}

const mstp = (state: AppState) => {
  const {builderConfig} = getActiveQuery(state)

  return {
    isInCheckOverlay: getIsInCheckOverlay(state),
    fillValues: builderConfig?.aggregateWindow?.fillValues ?? false,
  }
}

const mdtp = {
  onSetAggregateFillValues: setAggregateFillValues,
}

const connector = connect(mstp, mdtp)

export default connector(FillValues)
