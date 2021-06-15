import React, {CSSProperties, FC, useState} from 'react'
import {
  Grid,
  Form,
  Input,
  InputType,
  ComponentSize,
  InputLabel,
  FlexBox,
  FlexDirection,
  JustifyContent,
  AlignItems,
  Dropdown,
  ComponentStatus,
  DropdownMenuTheme,
  InfluxColors,
  SlideToggle,
} from '@influxdata/clockface'

import ThresholdsSettings from 'src/visualization/components/internal/ThresholdsSettings'

import {GeoViewProperties} from 'src/types'
import {VisualizationOptionProps} from 'src/visualization'
import {isFlagEnabled} from '../../../shared/utils/featureFlag'

import {findTags} from './utils'

import './GeoOptions.scss'

interface Props extends VisualizationOptionProps {
  properties: GeoViewProperties
}

const SHOW_GEO_OPTIONS = isFlagEnabled('mapGeoOptions')
// const mapTypeOptions = ['Point', 'Circle', 'Heat', 'Track']
export enum MapType {
  Point = 'pointMap',
  Circle = 'circleMap',
  Heat = 'heatmap',
  Track = 'trackMap',
}

export const GeoOptions: FC<Props> = ({properties, update, results}) => {
  const [useS2CellID, setUseS2CellID] = useState(true)

  const tags = findTags(results.table)

  const handleSetUseS2CellID = (): void => {
    update({
      legendHide: !properties.useS2CellID,
    })
  }

  const getToggleColor = (toggle: boolean): CSSProperties => {
    if (toggle) {
      return {color: InfluxColors.Cloud}
    }
    return {color: InfluxColors.Sidewalk}
  }

  console.log('tags: ', tags)
  return SHOW_GEO_OPTIONS ? (
    <>
      <Grid.Column>
        <Grid.Row>
          <FlexBox
            direction={FlexDirection.Row}
            alignItems={AlignItems.Center}
            margin={ComponentSize.Medium}
            stretchToFitWidth={true}
            style={{marginTop: '0.5em', marginBottom: '1.5em'}}
            testID="hover-legend-toggle"
          >
            <SlideToggle
              active={useS2CellID}
              size={ComponentSize.ExtraSmall}
              onChange={handleSetUseS2CellID}
            />
            <InputLabel style={getToggleColor(useS2CellID)}>
              Use S2 Cell ID for lat/lon
            </InputLabel>
          </FlexBox>
          <Dropdown
            style={{flex: '0 0 120px'}}
            button={(active, onClick) => (
              <Dropdown.Button
                active={active}
                onClick={onClick}
                status={ComponentStatus.Default}
              >
                <div className="color-dropdown--item">
                  <div className="color-dropdown--name">
                    Name of something here
                  </div>
                </div>
              </Dropdown.Button>
            )}
            menu={onCollapse => (
              <Dropdown.Menu
                onCollapse={onCollapse}
                theme={DropdownMenuTheme.Onyx}
              >
                {tags.map(tag => {
                  const index = tags.indexOf(tag)
                  return (
                    <Dropdown.Item
                      id={index}
                      key={tag.key}
                      value={tag.column}
                      selected={tag.key === ''}
                      onClick={() => console.log('chosen')}
                    >
                      <div className="color-dropdown--item">
                        <div className="color-dropdown--name">
                          Some capitalized name
                        </div>
                      </div>
                    </Dropdown.Item>
                  )
                })}
              </Dropdown.Menu>
            )}
          />
        </Grid.Row>
        <Form.Element label="Colorized Thresholds">
          <ThresholdsSettings
            thresholds={properties.layers[0].colors.filter(
              c => c.type !== 'scale'
            )}
            onSetThresholds={colors => {
              update({
                layers: [
                  {
                    type: 'pointMap',
                    colorDimension: {label: 'Value'},
                    colorField: '_value',
                    colors: colors,
                    isClustered: false,
                  },
                ],
              })
            }}
          />
        </Form.Element>
      </Grid.Column>
    </>
  ) : (
    <Grid.Column>
      <h4 className="view-options--header">Customize Geo Options</h4>
      <p>
        To display properly, your data will need to contain fields named 'lat'
        and 'lon' or a tag named 's2_cell_id'. For help customizing your query,
        please see our{' '}
        <a
          href="https://docs.influxdata.com/influxdb/cloud/visualize-data/visualization-types/map/"
          rel="noreferrer"
          target="_blank"
        >
          documentation
        </a>
      </p>
    </Grid.Column>
  )

  // const handleSelectGroupClick = (activeOption: string): void => {
  //   switch (MapType[activeOption]) {
  //     case 'pointMap':
  //       update({
  //         layers: [
  //           {
  //             type: 'pointMap',
  //             colorDimension: {label: 'Value'},
  //             colorField: '_value',
  //             colors: [
  //               {type: 'min', hex: InfluxColors.Star},
  //               {value: 50, hex: InfluxColors.Star},
  //               {type: 'max', hex: InfluxColors.Star},
  //             ],
  //             isClustered: false,
  //           },
  //         ],
  //       })
  //       break
  //     case 'heatmap':
  //       update({
  //         layers: [
  //           {
  //             type: 'heatmap',
  //             radius: 20,
  //             blur: 10,
  //             intensityDimension: {label: 'Lat'},
  //             intensityField: 'lat',
  //             colors: [
  //               {type: 'min', hex: '#00ff00'},
  //               {value: 50, hex: '#ffae42'},
  //               {value: 60, hex: '#ff0000'},
  //               {type: 'max', hex: '#ff0000'},
  //             ],
  //           },
  //         ],
  //       })
  //       break
  //     case 'trackMap':
  //       update({
  //         layers: [
  //           {
  //             type: 'trackMap',
  //             speed: 200,
  //             trackWidth: 4,
  //             randomColors: false,
  //             endStopMarkers: true,
  //             endStopMarkerRadius: 4,
  //             colors: [
  //               {type: 'min', hex: '#0000FF'},
  //               {type: 'max', hex: '#F0F0FF'},
  //             ],
  //           },
  //         ],
  //       })
  //       break
  //     case 'circleMap':
  //       update({
  //         layers: [
  //           {
  //             type: 'circleMap',
  //             radiusField: 'lat',
  //             radiusDimension: {label: 'lat'},
  //             colorDimension: {label: 'lon'},
  //             colorField: 'lon',
  //             colors: [
  //               {type: 'min', hex: '#ff00b3'},
  //               {value: 50, hex: '#343aeb'},
  //               {type: 'max', hex: '#343aeb'},
  //             ],
  //           },
  //         ],
  //       })
  //       break
  //   }
  // }
}
