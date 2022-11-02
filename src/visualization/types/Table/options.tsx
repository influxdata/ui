// Libraries
import React, {FC, useMemo, useCallback} from 'react'
import HTML5Backend from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'
import {
  ButtonShape,
  Columns,
  ComponentSize,
  Dropdown,
  EmptyState,
  FlexBox,
  FlexDirection,
  Form,
  Grid,
  InputLabel,
  SelectDropdown,
  SelectGroup,
  SlideToggle,
} from '@influxdata/clockface'

// Components
import DraggableColumn from 'src/shared/components/draggable_column/DraggableColumn'
import ThresholdsSettings from 'src/visualization/components/internal/ThresholdsSettings'
import {DecimalPlaces} from 'src/visualization/components/internal/DecimalPlaces'

// Utils
import {
  FORMAT_OPTIONS,
  resolveTimeFormat,
} from 'src/visualization/utils/timeFormat'
import {move} from 'src/shared/utils/move'

// Constants
import {
  THRESHOLD_TYPE_TEXT,
  THRESHOLD_TYPE_BG,
} from 'src/shared/constants/thresholds'

// Types
import {TableViewProperties, FieldOption} from 'src/types'
import {VisualizationOptionProps} from 'src/visualization'

// Styles
import './options.scss'

interface Props extends VisualizationOptionProps {
  properties: TableViewProperties
}

export const TableOptions: FC<Props> = ({properties, results, update}) => {
  const existing = (properties.fieldOptions || []).reduce((prev, curr) => {
    prev[curr.internalName] = curr
    return prev
  }, {})

  results.table.columnKeys
    .filter(o => !existing.hasOwnProperty(o))
    .filter(o => !['result', '', 'table', 'time'].includes(o))
    .forEach(o => {
      existing[o] = {
        internalName: o,
        displayName: o,
        visible: true,
      }
    })
  const fieldOptions = Object.keys(existing).map(e => existing[e])

  const updateTableOptions = useCallback(
    tableOptions => {
      update({
        tableOptions: {
          ...properties.tableOptions,
          ...tableOptions,
        },
      })
    },
    [update, properties.tableOptions]
  )

  const updateThreshold = useCallback(
    (threshold: string) => {
      if (threshold === THRESHOLD_TYPE_BG) {
        update({
          colors: properties.colors.map(color => {
            if (color.type !== 'scale') {
              return {
                ...color,
                type: THRESHOLD_TYPE_BG,
              }
            }

            return color
          }),
        })
      } else {
        update({
          colors: properties.colors.map(color => {
            if (color.type !== 'scale') {
              return {
                ...color,
                type: THRESHOLD_TYPE_TEXT,
              }
            }

            return color
          }),
        })
      }
    },
    [update, properties.colors]
  )

  const shouldSeeColumn = column =>
    column.internalName !== 'time' &&
    column.internalName !== '' &&
    column.internalName !== 'result' &&
    column.internalName !== 'table'

  const updateColumn = useCallback(
    (fieldOption: FieldOption) => {
      update({
        fieldOptions: fieldOptions.map(option => {
          if (option.internalName !== fieldOption.internalName) {
            return option
          }

          return {
            ...fieldOption,
          }
        }),
      })
    },
    [update, fieldOptions]
  )

  const moveColumn = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      update({
        fieldOptions: move(
          fieldOptions.filter(shouldSeeColumn),
          dragIndex,
          hoverIndex
        ),
      })
    },
    [update, fieldOptions]
  )

  const activeSetting =
    properties.colors.filter(color => color.type !== 'scale')[0]?.type || 'text'

  const draggableColumns = useMemo(
    () =>
      fieldOptions
        .filter(shouldSeeColumn)
        .map((column: FieldOption, idx: number) => (
          <DraggableColumn
            key={column.internalName}
            index={idx}
            id={column.internalName}
            internalName={column.internalName}
            displayName={column.displayName}
            visible={column.visible}
            onUpdateColumn={updateColumn}
            onMoveColumn={moveColumn}
          />
        )),
    [fieldOptions]
  )

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthMD={Columns.Six}
          className="view-options-container"
        >
          <h5 className="view-options--header">Formatting</h5>
          <Form.Element label="Default Sort Field">
            <Dropdown
              className="dropdown-stretch"
              button={(active, onClick) => (
                <Dropdown.Button active={active} onClick={onClick}>
                  {properties.tableOptions?.sortBy?.displayName ||
                    'Choose a sort field'}
                </Dropdown.Button>
              )}
              menu={onCollapse => (
                <Dropdown.Menu onCollapse={onCollapse}>
                  {fieldOptions
                    .filter(field => !!field.internalName)
                    .map(field => (
                      <Dropdown.Item
                        key={field.internalName}
                        id={field.internalName}
                        value={field}
                        onClick={(sortBy: FieldOption) => {
                          updateTableOptions({
                            sortBy,
                          })
                        }}
                        selected={
                          field.internalName ===
                          properties.tableOptions?.sortBy?.internalName
                        }
                      >
                        {field.displayName}
                      </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
              )}
            />
          </Form.Element>
          <Form.Element label="Time Format">
            <SelectDropdown
              options={FORMAT_OPTIONS.map(option => option.text)}
              selectedOption={resolveTimeFormat(properties.timeFormat)}
              onSelect={(timeFormat: string) => {
                update({timeFormat})
              }}
            />
          </Form.Element>
          <DecimalPlaces
            isEnforced={properties?.decimalPlaces?.isEnforced === true}
            digits={
              typeof properties?.decimalPlaces?.digits === 'number' ||
              properties?.decimalPlaces?.digits === null
                ? properties.decimalPlaces.digits
                : NaN
            }
            update={update}
          />
          <h5 className="view-options--header">Colorized Thresholds</h5>
          <ThresholdsSettings
            thresholds={properties.colors}
            onSetThresholds={colors => {
              update({colors})
            }}
          />
          <Form.Element label="Colorization" style={{marginTop: '16px'}}>
            <SelectGroup shape={ButtonShape.StretchToFit}>
              <SelectGroup.Option
                name="threshold-coloring"
                titleText="background"
                id="background"
                active={activeSetting === THRESHOLD_TYPE_BG}
                onClick={updateThreshold}
                value={THRESHOLD_TYPE_BG}
              >
                Background
              </SelectGroup.Option>
              <SelectGroup.Option
                name="threshold-coloring"
                titleText="text"
                id="text"
                active={activeSetting === THRESHOLD_TYPE_TEXT}
                onClick={updateThreshold}
                value={THRESHOLD_TYPE_TEXT}
              >
                Text
              </SelectGroup.Option>
            </SelectGroup>
          </Form.Element>
        </Grid.Column>
        <Grid.Column widthXS={Columns.Twelve} widthMD={Columns.Six}>
          <h5 className="view-options--header">Column Settings</h5>
          <Form.Element label="First Column">
            <Form.Box>
              <FlexBox
                direction={FlexDirection.Row}
                margin={ComponentSize.Small}
              >
                <InputLabel>Scroll with table</InputLabel>
                <SlideToggle
                  active={properties.tableOptions.fixFirstColumn}
                  onChange={() => {
                    updateTableOptions({
                      fixFirstColumn: !properties.tableOptions.fixFirstColumn,
                    })
                  }}
                  size={ComponentSize.ExtraSmall}
                />
                <InputLabel>Fixed</InputLabel>
              </FlexBox>
            </Form.Box>
          </Form.Element>
          <Form.Element label="Table Columns">
            <DndProvider backend={HTML5Backend}>
              <div>
                {!draggableColumns.length ? (
                  <Form.Box>
                    <EmptyState size={ComponentSize.Small}>
                      <EmptyState.Text>
                        This query returned no columns
                      </EmptyState.Text>
                    </EmptyState>
                  </Form.Box>
                ) : (
                  draggableColumns
                )}
              </div>
            </DndProvider>
          </Form.Element>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}
