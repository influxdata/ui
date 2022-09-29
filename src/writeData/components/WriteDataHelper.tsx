// Libraries
import React, {FC, useState} from 'react'

// Components
import {
  Panel,
  InfluxColors,
  Heading,
  HeadingElement,
  FontWeight,
  Grid,
  Columns,
  Icon,
  IconFont,
  ComponentSize,
} from '@influxdata/clockface'
import WriteDataHelperBuckets from 'src/writeData/components/WriteDataHelperBuckets'

interface Props {
  collapsed?: boolean
}

const WriteDataHelper: FC<Props> = ({collapsed}) => {
  const [mode, changeMode] = useState<'expanded' | 'collapsed'>(
    collapsed ? 'collapsed' : 'expanded'
  )

  const handleToggleClick = (): void => {
    if (mode === 'expanded') {
      changeMode('collapsed')
    } else {
      changeMode('expanded')
    }
  }

  return (
    <Panel backgroundColor={InfluxColors.Grey15}>
      <Panel.Header size={ComponentSize.ExtraSmall}>
        <div
          className={`write-data-helper--heading write-data-helper--heading__${mode}`}
          onClick={handleToggleClick}
        >
          <Icon
            glyph={IconFont.CaretRight_New}
            className="write-data-helper--caret"
          />
          <Heading
            element={HeadingElement.H5}
            weight={FontWeight.Regular}
            selectable={true}
          >
            Code Sample Options
          </Heading>
        </div>
      </Panel.Header>
      {mode === 'expanded' && (
        <Panel.Body size={ComponentSize.ExtraSmall}>
          <p>
            Control how code samples in the documentation are populated with
            system resources. Not all code samples make use of system resources.
          </p>
          <Grid>
            <Grid.Row>
              <Grid.Column widthSM={Columns.Twelve}>
                <WriteDataHelperBuckets />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Panel.Body>
      )}
    </Panel>
  )
}

export default WriteDataHelper
