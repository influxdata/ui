import {FC} from 'react'

/*
import ColumnSelector from 'src/shared/components/ColumnSelector'
import {Grid, Form, Dropdown} from '@influxdata/clockface'
import YAxisTitle from 'src/timeMachine/components/view_options/YAxisTitle'
import YAxisBase from 'src/timeMachine/components/view_options/YAxisBase'
import AxisAffixes from 'src/timeMachine/components/view_options/AxisAffixes'
     */

const GraphViewOptions: FC = () => {
  return null
  /*
    return (
        <>
            <>
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
            </>
            <>
                <h5 className="view-options--header">Options</h5>
                {geom && <Geom geom={geom} onSetGeom={onSetGeom} />}
                <ColorSelector
                    colors={colors.filter(c => c.type === 'scale')}
                    onUpdateColors={onUpdateColors}
                />
                <Checkbox
                    label="Shade Area Below Lines"
                    checked={!!shadeBelow}
                    onSetChecked={onSetShadeBelow}
                />
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
            </>
            <>
                <h5 className="view-options--header">Y Axis</h5>
                <YAxisTitle label={label} onUpdateYAxisLabel={onUpdateYAxisLabel} />
                <YAxisBase base={base} onUpdateYAxisBase={onUpdateYAxisBase} />
                <AxisAffixes
                    prefix={prefix}
                    suffix={suffix}
                    axisName="y"
                    onUpdateAxisPrefix={prefix => onUpdateAxisPrefix(prefix, 'y')}
                    onUpdateAxisSuffix={suffix => onUpdateAxisSuffix(suffix, 'y')}
                />
                <AutoDomainInput
                    domain={this.yDomain}
                    onSetDomain={this.handleSetYDomain}
                    label="Y Axis Domain"
                />
                <Form.Element label="Positioning">
                    <Dropdown
                        button={(active, onClick) => (
                            <Dropdown.Button active={active} onClick={onClick}>
                                {capitalize(position)}
                            </Dropdown.Button>
                        )}
                        menu={onCollapse => (
                            <Dropdown.Menu onCollapse={onCollapse}>
                                <Dropdown.Item
                                    id="overlaid"
                                    value="overlaid"
                                    onClick={onSetPosition}
                                    selected={position === 'overlaid'}
                                >
                                    Overlaid
                                </Dropdown.Item>
                                <Dropdown.Item
                                    id="stacked"
                                    value="stacked"
                                    onClick={onSetPosition}
                                    selected={position === 'stacked'}
                                >
                                    Stacked
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        )}
                    />
                </Form.Element>
            </>
        </>
    )
    */
}

export default GraphViewOptions
