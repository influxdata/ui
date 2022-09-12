// Libraries
import React, {FC, useContext, useMemo} from 'react'

// Components
import {
  AlignItems,
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  IconFont,
  FlexBox,
  FlexDirection,
  Form,
  TextBlock,
} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'
import ColumnDropdown from 'src/flows/pipes/Visualization/ErrorThresholds/FieldColumnDropdown'
import FunctionDropdown from 'src/flows/pipes/Visualization/ErrorThresholds/FunctionDropdown'
import ThresholdEntryColumn from 'src/flows/pipes/Visualization/ErrorThresholds/ThresholdEntryColumn'
import {event} from 'src/cloud/utils/reporting'
import {ErrorThreshold} from 'src/flows/pipes/Visualization/threshold'
import './ErrorThresholds.scss'

const ErrorThresholds: FC = () => {
  const {data, results, update} = useContext(PipeContext)

  const fields = Array.from(
    new Set(results.parsed.table.columns['_field']?.data as string[])
  )

  const errorThresholds = useMemo(
    () => data?.errorThresholds ?? [],
    [data?.errorThresholds]
  )

  const handleAddThreshold = () => {
    event('Error Threshold Added to Visualization Panel')
    update({
      errorThresholds: [
        ...(errorThresholds ?? []),
        {
          type: 'equal',
          value: 0,
          fieldType: 'not-number',
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
          {data?.errorThresholds?.map(
            (threshold: ErrorThreshold, index: number) => (
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
            )
          )}
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
            status={
              fields.length > 0
                ? ComponentStatus.Default
                : ComponentStatus.Disabled
            }
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
