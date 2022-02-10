// Libraries
import React, {FC, useContext, useMemo} from 'react'

// Components
import {
  AlignItems,
  Button,
  ComponentColor,
  ComponentSize,
  IconFont,
  FlexBox,
  FlexDirection,
  Form,
  TextBlock,
} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'
import ColumnDropdown from 'src/flows/pipes/Visualization/ErrorThresholds/ColumnDropdown'
import FunctionDropdown from 'src/flows/pipes/Visualization/ErrorThresholds/FunctionDropdown'
import ThresholdEntryColumn from 'src/flows/pipes/Visualization/ErrorThresholds/ThresholdEntryColumn'
import {event} from 'src/cloud/utils/reporting'
import './ErrorThresholds.scss'

const ErrorThresholds: FC = () => {
  const {data, update} = useContext(PipeContext)

  const errorThresholds = useMemo(() => data?.errorThresholds ?? [], [
    data?.errorThresholds,
  ])

  const handleAddThreshold = () => {
    event('Error Threshold Added to Visualization Panel')
    update({
      errorThresholds: [
        ...(errorThresholds ?? []),
        {
          type: 'greater',
          value: 0,
        },
      ],
    })
  }

  const handleRemoveThreshold = (index: number) => {
    const copy = errorThresholds.slice()
    copy.splice(index, 1)

    update({
      errorThresholds: copy,
    })
  }

  return (
    <FlexBox
      direction={FlexDirection.Column}
      alignItems={AlignItems.Stretch}
      margin={ComponentSize.Medium}
      testID="threshold-error-settings"
      className="view-options"
    >
      <Form.Element label="Error Thresholds">
        <FlexBox
          direction={FlexDirection.Column}
          margin={ComponentSize.Small}
          testID="component-spacer"
          stretchToFitWidth
        >
          {data?.errorThresholds?.map((threshold: any, index: number) => (
            <FlexBox
              direction={FlexDirection.Row}
              margin={ComponentSize.Medium}
              stretchToFitWidth
              testID="component-spacer"
              key={`${threshold.type}_${index}`}
            >
              <FlexBox.Child grow={3} testID="component-spacer--flex-child">
                <FlexBox
                  stretchToFitWidth
                  className="error-threshold-flex--margin"
                >
                  <TextBlock
                    testID="when-value-text-block"
                    text={index === 0 ? 'When' : 'And'}
                    className="error-threshold--text-block"
                  />
                  <ColumnDropdown threshold={threshold} index={index} />
                </FlexBox>
                <FlexBox
                  stretchToFitWidth
                  className="error-threshold-flex--margin"
                >
                  <TextBlock
                    testID="is-value-text-block"
                    text="is"
                    className="error-threshold--text-block"
                  />
                  <FunctionDropdown threshold={threshold} index={index} />
                </FlexBox>
                <ThresholdEntryColumn threshold={threshold} index={index} />
              </FlexBox.Child>
              <Button
                icon={IconFont.Trash_New}
                size={ComponentSize.Small}
                onClick={() => handleRemoveThreshold(index)}
                color={ComponentColor.Tertiary}
              />
            </FlexBox>
          ))}
        </FlexBox>
        <FlexBox
          direction={FlexDirection.Row}
          margin={ComponentSize.Small}
          stretchToFitWidth
          testID="component-spacer"
        >
          <Button
            text="Add Threshold"
            icon={IconFont.Plus_New}
            size={ComponentSize.Small}
            onClick={handleAddThreshold}
            color={ComponentColor.Primary}
            className="add-error-threshold--button"
          />
        </FlexBox>
      </Form.Element>
    </FlexBox>
  )
}

export default ErrorThresholds
