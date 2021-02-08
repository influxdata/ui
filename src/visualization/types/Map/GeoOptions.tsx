import React, {FC} from 'react'
import {Grid, SelectGroup, Form, RangeSlider} from '@influxdata/clockface'

import {CustomHeatMapOptions} from 'src/visualization/types/Map/CustomHeatmapOptions'

import {GeoViewProperties} from 'src/types'
import {VisualizationOptionProps} from 'src/visualization'

import './GeoOptions.scss'

interface Props extends VisualizationOptionProps {
  properties: GeoViewProperties
}

const mapTypeOptions = ['Point', 'Circle', 'Heat', 'Track']
enum LatRangeSlider {
  Min = -90,
  Max = 90,
}
enum LonRangeSlider {
  Min = -180,
  Max = 180,
}

enum ZoomRangeSlider {
  Min = 0,
  Max = 20,
}
export enum MapType {
  Point = 'pointMap',
  Circle = 'circleMap',
  Heat = 'heatmap',
  Track = 'trackMap',
}

export const GeoOptions: FC<Props> = ({properties, update}) => {
  const handleSelectGroupClick = (activeOption: string): void => {
    switch (MapType[activeOption]) {
      case 'pointMap':
        update({
          layers: [
            {
              type: 'pointMap',
              colorDimension: {label: 'Duration'},
              colorField: 'duration',
              colors: [
                {type: 'min', hex: '#ff0000'},
                {value: 50, hex: '#343aeb'},
                {type: 'max', hex: '#343aeb'},
              ],
              isClustered: false,
            },
          ],
        })
        break
      case 'heatmap':
        update({
          layers: [
            {
              type: 'heatmap',
              radius: 20,
              blur: 10,
              intensityDimension: {label: 'Value'},
              intensityField: '_value',
              colors: [
                {type: 'min', hex: '#00ff00'},
                {value: 50, hex: '#ffae42'},
                {value: 60, hex: '#ff0000'},
                {type: 'max', hex: '#ff0000'},
              ],
            },
          ],
        })
        break
      case 'trackMap':
        update({
          layers: [
            {
              type: 'trackMap',
              speed: 200,
              trackWidth: 4,
              randomColors: false,
              endStopMarkers: true,
              endStopMarkerRadius: 4,
              colors: [
                {type: 'min', hex: '#0000FF'},
                {type: 'max', hex: '#F0F0FF'},
              ],
            },
          ],
        })
        break
      case 'circleMap':
        update({
          layers: [
            {
              type: 'circleMap',
              radiusField: 'magnitude',
              radiusDimension: {label: 'Magnitude'},
              colorDimension: {label: 'Duration'},
              colorField: 'duration',
              colors: [
                {type: 'min', hex: '#ff00b3'},
                {value: 50, hex: '#343aeb'},
                {type: 'max', hex: '#343aeb'},
              ],
            },
          ],
        })
        break
    }
  }

  const handleSelectLatitude = (latitude: number) => {
    update({
      center: {
        ...properties.center,
        lat: latitude,
      },
    })
  }

  const handleSelectLongitude = (longitude: number) => {
    update({
      center: {
        ...properties.center,
        lon: longitude,
      },
    })
  }

  const handleTogglePanZoom = () => {
    update({
      allowPanAndZoom: !properties.allowPanAndZoom,
    })
  }

  const handleZoomSelect = (zoomValue: number) => {
    update({
      zoom: zoomValue,
    })
  }

  return (
    <>
      <SelectGroup className="mapTypeOptions">
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
      </SelectGroup>
      <Grid.Column>
        <h4 className="view-options--header">Customize Geo Options</h4>
        <Form.Element label="Allow Pan And Zoom" className="allowPanAndZoom">
          <input
            className="allowPanZoomInput"
            checked={properties.allowPanAndZoom === true}
            onChange={handleTogglePanZoom}
            type="checkbox"
            data-testid="geo-toggle-pan-zoom"
          />
        </Form.Element>
        <Form.Element label="Latitude">
          <RangeSlider
            min={LatRangeSlider.Min}
            max={LatRangeSlider.Max}
            value={properties.center.lat}
            onChange={event => {
              handleSelectLatitude(parseFloat(event.target.value))
            }}
            testID="geo-latitude"
          />
        </Form.Element>
        <Form.Element label="Longitude">
          <RangeSlider
            min={LonRangeSlider.Min}
            max={LonRangeSlider.Max}
            value={properties.center.lon}
            onChange={event => {
              handleSelectLongitude(parseFloat(event.target.value))
            }}
            testID="geo-longitude"
          />
        </Form.Element>
        <Form.Element label="Zoom">
          <RangeSlider
            min={ZoomRangeSlider.Min}
            max={ZoomRangeSlider.Max}
            value={properties.zoom}
            onChange={event => {
              handleZoomSelect(parseFloat(event.target.value))
            }}
            testID="geo-zoom"
          />
        </Form.Element>
        {properties.layers[0]?.type === MapType.Heat && (
          <CustomHeatMapOptions
            properties={properties}
            update={update}
            results={null}
          />
        )}
      </Grid.Column>
    </>
  )
}
