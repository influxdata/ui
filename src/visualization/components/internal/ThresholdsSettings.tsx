import React, {useState, FC} from 'react'

// Components
import ThresholdSetting from 'src/shared/components/ThresholdSetting'
import {
  Button,
  ButtonShape,
  IconFont,
  FlexBox,
  ComponentSize,
  FlexDirection,
  AlignItems,
} from '@influxdata/clockface'

// Utils
import {
  sortThresholds,
  validateThresholds,
  addThreshold,
} from 'src/shared/utils/thresholds'

// Types
import {Color} from 'src/types'

interface Props {
  thresholds: Color[]
  onSetThresholds: (thresholds: Color[]) => void
}

const ThresholdsSettings: FC<Props> = ({thresholds, onSetThresholds}) => {
  const [errors, setErrors] = useState({})

  const appendThreshold = () => {
    const defaultThreshold = addThreshold(thresholds)

    onSetThresholds([...thresholds, defaultThreshold])
  }

  const updateThreshold = (id: string, value: Partial<Color>) => {
    onSetThresholds(
      thresholds.map(threshold => {
        if (threshold.id !== id) {
          return threshold
        }

        return {
          ...threshold,
          ...value,
        }
      })
    )
  }

  const removeThreshold = (id: string) => {
    onSetThresholds(thresholds.filter(threshold => threshold.id !== id))
  }

  const onBlur = () => {
    setErrors(validateThresholds(thresholds))
  }

  return (
    <FlexBox
      direction={FlexDirection.Column}
      alignItems={AlignItems.Stretch}
      margin={ComponentSize.Medium}
      testID="threshold-settings"
    >
      <Button
        shape={ButtonShape.StretchToFit}
        icon={IconFont.Plus}
        text="Add a Threshold"
        onClick={() => appendThreshold()}
      />
      {sortThresholds(thresholds).map(threshold => {
        const onChangeValue = value =>
          updateThreshold(threshold.id, {value: parseFloat(value)})

        const onChangeColor = (name, hex) =>
          updateThreshold(threshold.id, {name, hex})

        const onRemove = () => removeThreshold(threshold.id)

        return (
          <ThresholdSetting
            key={`threshold-${threshold.id}`}
            id={`threshold-${threshold.id}`}
            name={threshold.name}
            type={threshold.type}
            value={'' + threshold.value}
            error={errors[threshold.id]}
            onBlur={onBlur}
            onRemove={onRemove}
            onChangeValue={onChangeValue}
            onChangeColor={onChangeColor}
          />
        )
      })}
    </FlexBox>
  )
}

export default ThresholdsSettings
