// Libraries
import React, {ChangeEvent, PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  ComponentStatus,
  Dropdown,
  Form,
  Grid,
  Input,
  InputType,
  SelectDropdown,
} from '@influxdata/clockface'
import Geom from 'src/timeMachine/components/view_options/Geom'
import YAxisTitle from 'src/timeMachine/components/view_options/YAxisTitle'
import AxisAffixes from 'src/timeMachine/components/view_options/AxisAffixes'
import ColorSelector from 'src/timeMachine/components/view_options/ColorSelector'
import AutoDomainInput from 'src/shared/components/AutoDomainInput'
import YAxisBase from 'src/timeMachine/components/view_options/YAxisBase'
import ColumnSelector from 'src/shared/components/ColumnSelector'
import TimeFormat from 'src/timeMachine/components/view_options/TimeFormat'
import LegendOrientation from 'src/timeMachine/components/view_options/LegendOrientation'

// Actions
import {
  setColors,
  setYAxisLabel,
  setAxisPrefix,
  setAxisSuffix,
  setYAxisBounds,
  setYAxisBase,
  setGeom,
  setXColumn,
  setYColumn,
  setTimeFormat,
  setHoverDimension,
  setUpperColumn,
  setMainColumn,
  setLowerColumn,
  setLegendOpacity,
  setLegendOrientationThreshold,
} from 'src/timeMachine/actions'

// Utils
import {getMainColumnName, parseYBounds} from 'src/shared/utils/vis'
import {
  getXColumnSelection,
  getYColumnSelection,
  getNumericColumns,
  getActiveQuery,
  getActiveTimeMachine,
} from 'src/timeMachine/selectors'

// Types
import {
  AppState,
  XYGeom,
  Axes,
  Color,
  NewView,
  BandViewProperties,
  ViewType,
} from 'src/types'

// Constants
import {QUERY_BUILDER_MODE} from 'src/shared/constants'

interface OwnProps {
  type: ViewType
  axes: Axes
  geom?: XYGeom
  colors: Color[]
  hoverDimension?: 'auto' | 'x' | 'y' | 'xy'
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

interface State {
  upperColumn: string
  mainColumn: string
  lowerColumn: string
}

const REMOVE_COLUMN_TEXT = '(remove column)'
const UPPER_COLUMN_PLACEHOLDER = `Please enter upper column's function name`
const MAIN_COLUMN_PLACEHOLDER = `Please enter main column's function name`
const LOWER_COLUMN_PLACEHOLDER = `Please enter lower column's function name`

class BandOptions extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {upperColumn: '', mainColumn: '', lowerColumn: ''}
  }

  public render() {
    const {
      axes: {
        y: {label, prefix, suffix, base},
      },
      colors,
      editMode,
      geom,
      onUpdateColors,
      onUpdateYAxisLabel,
      onUpdateAxisPrefix,
      onUpdateAxisSuffix,
      onUpdateYAxisBase,
      onSetGeom,
      onSetYColumn,
      yColumn,
      onSetXColumn,
      xColumn,
      numericColumns,
      onSetTimeFormat,
      timeFormat,
      hoverDimension = 'auto',
      onSetHoverDimension,
      selectedFunctions,
      onSetMainColumn,
      upperColumn,
      lowerColumn,
      onSetLegendOpacity,
      onSetLegendOrientationThreshold,
    } = this.props

    const upperAndLowerColumnOptions = [
      REMOVE_COLUMN_TEXT,
      ...selectedFunctions,
    ]

    return (
      <>
        <Grid.Column>
          <h4 className="view-options--header">Customize Band Plot</h4>
          <h5 className="view-options--header">Data</h5>
          <ColumnSelector
            selectedColumn={xColumn}
            onSelectColumn={onSetXColumn}
            availableColumns={numericColumns}
            axisName="x"
          />
          <ColumnSelector
            selectedColumn={yColumn}
            onSelectColumn={onSetYColumn}
            availableColumns={numericColumns}
            axisName="y"
          />
          <Form.Element label="Time Format">
            <TimeFormat
              timeFormat={timeFormat}
              onTimeFormatChange={onSetTimeFormat}
            />
          </Form.Element>
        </Grid.Column>
        {editMode === QUERY_BUILDER_MODE ? (
          <Grid.Column>
            <h5 className="view-options--header">Aggregate Functions</h5>
            <Form.Element label="Upper Column Name">
              <SelectDropdown
                selectedOption={upperColumn}
                options={upperAndLowerColumnOptions}
                onSelect={this.onChangeUpperColumn}
              />
            </Form.Element>
            <Form.Element label="Main Column Name">
              <SelectDropdown
                selectedOption={this.selectedMainColumn}
                options={selectedFunctions}
                onSelect={onSetMainColumn}
              />
            </Form.Element>
            <Form.Element label="Lower Column Name">
              <SelectDropdown
                selectedOption={lowerColumn}
                options={upperAndLowerColumnOptions}
                onSelect={this.onChangeLowerColumn}
              />
            </Form.Element>
            <h5 className="view-options--header">Options</h5>
          </Grid.Column>
        ) : (
          // SCRIPT EDITOR MODE
          <Grid.Column>
            <h5 className="view-options--header">Aggregate Functions</h5>
            <Form.Element label="Upper Column Name">
              <Input
                onChange={this.onTextChangeUpperColumn}
                onFocus={this.onTextChangeUpperColumn}
                placeholder={UPPER_COLUMN_PLACEHOLDER}
                type={InputType.Text}
                value={this.state.upperColumn}
              />
            </Form.Element>
            <Form.Element label="Main Column Name">
              <Input
                onChange={this.onTextChangeMainColumn}
                onFocus={this.onTextChangeMainColumn}
                placeholder={MAIN_COLUMN_PLACEHOLDER}
                status={this.mainColumnTextStatus}
                type={InputType.Text}
                value={this.state.mainColumn}
              />
            </Form.Element>
            <Form.Element label="Lower Column Name">
              <Input
                onChange={this.onTextChangeLowerColumn}
                onFocus={this.onTextChangeLowerColumn}
                placeholder={LOWER_COLUMN_PLACEHOLDER}
                type={InputType.Text}
                value={this.state.lowerColumn}
              />
            </Form.Element>
            <h5 className="view-options--header">Options</h5>
          </Grid.Column>
        )}
        {geom && <Geom geom={geom} onSetGeom={onSetGeom} />}
        <ColorSelector
          colors={colors.filter(c => c.type === 'scale')}
          onUpdateColors={onUpdateColors}
        />
        <Grid.Column>
          <br />
          <Form.Element label="Hover Dimension">
            <Dropdown
              button={(active, onClick) => (
                <Dropdown.Button active={active} onClick={onClick}>
                  {hoverDimension}
                </Dropdown.Button>
              )}
              menu={onCollapse => (
                <Dropdown.Menu onCollapse={onCollapse}>
                  <Dropdown.Item
                    id="auto"
                    value="auto"
                    onClick={onSetHoverDimension}
                    selected={hoverDimension === 'auto'}
                  >
                    Auto
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="x"
                    value="x"
                    onClick={onSetHoverDimension}
                    selected={hoverDimension === 'x'}
                  >
                    X Axis
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="y"
                    value="y"
                    onClick={onSetHoverDimension}
                    selected={hoverDimension === 'y'}
                  >
                    Y Axis
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="xy"
                    value="xy"
                    onClick={onSetHoverDimension}
                    selected={hoverDimension === 'xy'}
                  >
                    X & Y Axis
                  </Dropdown.Item>
                </Dropdown.Menu>
              )}
            />
          </Form.Element>
        </Grid.Column>
        <Grid.Column>
          <h5 className="view-options--header">Y Axis</h5>
        </Grid.Column>
        <YAxisTitle label={label} onUpdateYAxisLabel={onUpdateYAxisLabel} />
        <YAxisBase base={base} onUpdateYAxisBase={onUpdateYAxisBase} />
        <AxisAffixes
          prefix={prefix}
          suffix={suffix}
          axisName="y"
          onUpdateAxisPrefix={prefix => onUpdateAxisPrefix(prefix, 'y')}
          onUpdateAxisSuffix={suffix => onUpdateAxisSuffix(suffix, 'y')}
        />
        <Grid.Column>
          <AutoDomainInput
            domain={this.yDomain}
            onSetDomain={this.handleSetYDomain}
            label="Y Axis Domain"
          />
        </Grid.Column>
        <LegendOrientation
          onLegendOpacityChange={onSetLegendOpacity}
          onLegendOrientationThresholdChange={onSetLegendOrientationThreshold}
        />
      </>
    )
  }

  private get yDomain(): [number, number] {
    return parseYBounds(this.props.axes.y.bounds)
  }

  private get selectedMainColumn(): string {
    return getMainColumnName(
      this.props.selectedFunctions,
      this.props.upperColumn,
      this.props.mainColumn,
      this.props.lowerColumn
    )
  }

  private get mainColumnTextStatus(): ComponentStatus {
    if (this.state.mainColumn.length > 0) {
      return ComponentStatus.Default
    }
    return ComponentStatus.Error
  }

  private setBoundValues = (value: number | null): string | null => {
    return value === null ? null : String(value)
  }

  private handleSetYDomain = (yDomain: [number, number]): void => {
    let bounds: [string | null, string | null]

    if (yDomain) {
      const [min, max] = yDomain
      bounds = [this.setBoundValues(min), this.setBoundValues(max)]
    } else {
      bounds = [null, null]
    }

    this.props.onUpdateYAxisBounds(bounds)
  }

  private onChangeColumn = (columnSetter, selectedColumnName) => {
    const REMOVED_COLUMN = REMOVE_COLUMN_TEXT || ''
    if (selectedColumnName === REMOVED_COLUMN) {
      columnSetter('')
    } else {
      columnSetter(selectedColumnName)
    }
  }

  private onChangeUpperColumn = selectedUpperColumnName => {
    this.onChangeColumn(this.props.onSetUpperColumn, selectedUpperColumnName)
  }

  private onChangeLowerColumn = selectedLowerColumnName =>
    this.onChangeColumn(this.props.onSetLowerColumn, selectedLowerColumnName)

  private onTextChangeUpperColumn = (event: ChangeEvent<HTMLInputElement>) => {
    const {value} = event.target
    this.setState({upperColumn: value})
    this.props.onSetUpperColumn(value)
  }

  private onTextChangeMainColumn = (event: ChangeEvent<HTMLInputElement>) => {
    const {value} = event.target
    this.setState({mainColumn: value})
    this.props.onSetMainColumn(value)
  }

  private onTextChangeLowerColumn = (event: ChangeEvent<HTMLInputElement>) => {
    const {value} = event.target
    this.setState({lowerColumn: value})
    this.props.onSetLowerColumn(value)
  }
}

const mstp = (state: AppState) => {
  const activeQuery = getActiveQuery(state)
  const {builderConfig, editMode} = activeQuery
  const {functions} = builderConfig
  const xColumn = getXColumnSelection(state)
  const yColumn = getYColumnSelection(state)
  const numericColumns = getNumericColumns(state)
  const view = getActiveTimeMachine(state).view as NewView<BandViewProperties>
  const {timeFormat, upperColumn, mainColumn, lowerColumn} = view.properties
  return {
    editMode,
    numericColumns,
    selectedFunctions: functions.map(f => f.name),
    timeFormat,
    xColumn,
    yColumn,
    upperColumn,
    mainColumn,
    lowerColumn,
  }
}

const mdtp = {
  onUpdateYAxisLabel: setYAxisLabel,
  onUpdateAxisPrefix: setAxisPrefix,
  onUpdateAxisSuffix: setAxisSuffix,
  onUpdateYAxisBounds: setYAxisBounds,
  onUpdateYAxisBase: setYAxisBase,
  onSetXColumn: setXColumn,
  onSetYColumn: setYColumn,
  onUpdateColors: setColors,
  onSetGeom: setGeom,
  onSetTimeFormat: setTimeFormat,
  onSetHoverDimension: setHoverDimension,
  onSetUpperColumn: setUpperColumn,
  onSetMainColumn: setMainColumn,
  onSetLowerColumn: setLowerColumn,
  onSetLegendOpacity: setLegendOpacity,
  onSetLegendOrientationThreshold: setLegendOrientationThreshold,
}

const connector = connect(mstp, mdtp)

export default connector(BandOptions)
