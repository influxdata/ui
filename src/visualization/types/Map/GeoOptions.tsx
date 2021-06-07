import React, {FC} from 'react'
import {Grid, Form} from '@influxdata/clockface'

import ThresholdsSettings from 'src/visualization/components/internal/ThresholdsSettings'

import {GeoViewProperties} from 'src/types'
import {VisualizationOptionProps} from 'src/visualization'
import {isFlagEnabled} from '../../../shared/utils/featureFlag'

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

export const GeoOptions: FC<Props> = ({properties, update}) => {
  const thresholdColor = properties.layers[0].colors

  return SHOW_GEO_OPTIONS ? (
    <>
      {/* <SelectGroup className="mapTypeOptions">
        {mapTypeOptions.map((mapTypeOption: string, index: number) => (
          <SelectGroup.Option
            key={mapTypeOption}
            id={mapTypeOption}
            name="mapTypeOptions"
            value={mapTypeOption}
            active={properties?.layers[0]?.type === MapType[mapTypeOption]}
            onClick={handleSelectGroupClick}
            tabIndex={index + 1}
            testID={`${mapTypeOption}-option`}
            disabled={mapTypeOption === 'Track'}
          >
            {mapTypeOption}
          </SelectGroup.Option>
        ))}
        </SelectGroup> */}

      <Grid.Column>
        <Form.Element label="Colorized Thresholds">
          <ThresholdsSettings
            thresholds={thresholdColor}
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
