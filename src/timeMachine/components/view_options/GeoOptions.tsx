import React, {FC} from 'react'
import {useDispatch} from 'react-redux'
import CustomHeatMapOptions from 'src/timeMachine/components/view_options/CustomHeatmapOptions'
import {
  setLatitude,
  setLongitude,
  setAllowPanAndZoom,
  setZoomValue,
  setMapType,
} from 'src/timeMachine/actions/geoOptionsCreators'
import {GeoViewProperties} from 'src/types'
import {Grid, SelectGroup, Form, RangeSlider} from '@influxdata/clockface'
import './GeoOptions.scss'
const mapTypeOptions = ['Point', 'Circle', 'Heat', 'Track']
enum LatMinMax {
  Min = -90,
  Max = 90,
}
enum LonMinMax {
  Min = -180,
  Max = 180,
}

enum ZoomMinMax {
  Min = 0,
  Max = 20,
}
export enum MapType {
  Point = 'pointMap',
  Circle = 'circleMap',
  Heat = 'heatmap',
  Track = 'trackMap',
}

const displayCustomOptions = (mapType: MapType) => {
  switch (mapType) {
    case MapType.Heat: {
      return <CustomHeatMapOptions />
    }
    case MapType.Track:
    case MapType.Point:
    case MapType.Circle:
    default:
      return null
  }
}

export const GeoOptions: FC<GeoViewProperties> = props => {
  const dispatch = useDispatch()
  const handleSelectGroupClick = (activeOption: string): void => {
    dispatch(setMapType(MapType[activeOption]))
  }
  const handleSelectLatitude = (latitude: number) => {
    dispatch(setLatitude(latitude))
  }
  const handleSelectLongitude = (longitude: number) => {
    dispatch(setLongitude(longitude))
  }
  const handleTogglePanZoom = () => {
    dispatch(setAllowPanAndZoom(!props.allowPanAndZoom))
  }
  const handleZoomSelect = (zoomValue: number) => {
    dispatch(setZoomValue(zoomValue))
  }
  return (
    <>
      <SelectGroup className="mapTypeOptions" testID="maptypeselect">
        {mapTypeOptions.map((mapTypeOption: string, index: number) => (
          <SelectGroup.Option
            key={mapTypeOption}
            id={mapTypeOption}
            name="mapTypeOptions"
            value={mapTypeOption}
            active={props?.layers[0]?.type === MapType[mapTypeOption]}
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
            checked={props.allowPanAndZoom === true}
            onChange={handleTogglePanZoom}
            type="checkbox"
            data-testid="geo-toggle-pan-zoom"
          />
        </Form.Element>
        <Form.Element label="Latitude">
          <RangeSlider
            min={LatMinMax.Min}
            max={LatMinMax.Max}
            value={props.center.lat}
            onChange={event => {
              handleSelectLatitude(parseFloat(event.target.value))
            }}
            testID="geo-latitude"
          />
        </Form.Element>
        <Form.Element label="Longitude">
          <RangeSlider
            min={LonMinMax.Min}
            max={LonMinMax.Max}
            value={props.center.lon}
            onChange={event => {
              handleSelectLongitude(parseFloat(event.target.value))
            }}
            testID="geo-longitude"
          />
        </Form.Element>
        <Form.Element label="Zoom">
          <RangeSlider
            min={ZoomMinMax.Min}
            max={ZoomMinMax.Max}
            value={props.zoom}
            onChange={event => {
              handleZoomSelect(parseFloat(event.target.value))
            }}
            testID="geo-zoom"
          />
        </Form.Element>
        {displayCustomOptions(props?.layers[0]?.type)}
      </Grid.Column>
    </>
  )
}
