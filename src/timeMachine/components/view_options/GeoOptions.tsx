import React, {FC} from 'react'
import {useDispatch} from 'react-redux'
import CustomHeatMapOptions from 'src/timeMachine/components/view_options/CustomHeatmapOptions'
import {
  setLatitude,
  setLongitude,
  setAllowPanAndZoom,
  setZoomValue,
  setMapType,
} from 'src/timeMachine/actions'
import {GeoViewProperties} from 'src/types'
import {Grid, SelectGroup, Form, RangeSlider} from '@influxdata/clockface'

const selectOptions = ['Point', 'Circle', 'Heat', 'Track']
const mapTypeHash = {
  Point: 'pointMap',
  Circle: 'circleMap',
  Heat: 'heatmap',
  Track: 'trackMap',
}

const displayCustomOptions = (mapType: string) => {
  /* Eventually, the other map type subtype customizations can be added here */

  switch (mapType) {
    case 'heatmap':
      return <CustomHeatMapOptions />
    case 'trackMap':
    case 'pointMap':
    case 'circleMap':
    default:
      return null
  }
}

const GeoOptions: FC<GeoViewProperties> = props => {
  const dispatch = useDispatch()
  const handleSelectGroupClick = (activeOption: string): void => {
    dispatch(setMapType(mapTypeHash[activeOption]))
  }
  const handleLatLongSelect = (latLonVal: number, type: string = 'lat') => {
    type === 'lon'
      ? dispatch(setLongitude(latLonVal))
      : dispatch(setLatitude(latLonVal))
  }
  const handleSetPanZoom = () => {
    dispatch(setAllowPanAndZoom(!props.allowPanAndZoom))
  }
  const handleZoomSelect = (zoomValue: number) => {
    dispatch(setZoomValue(zoomValue))
  }
  return (
    <>
      <SelectGroup
        style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)'}}
        testID="maptypeselect"
      >
        {selectOptions.map((s: string, i: number) => (
          <SelectGroup.Option
            key={i}
            id={s}
            name="selectOptions"
            value={s}
            active={props.layers[0].type === mapTypeHash[s]}
            onClick={handleSelectGroupClick}
            tabIndex={i + 1}
            testID={`${s}-option`}
            disabled={s === 'Track'}
          >
            {s}
          </SelectGroup.Option>
        ))}
      </SelectGroup>
      <Grid.Column>
        <h4 className="view-options--header">Customize Geo Options</h4>
        <Form.Element
          label="Allow Pan And Zoom"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            width: '100%',
          }}
        >
          <input
            style={{left: '20px', justifySelf: 'end'}}
            checked={props.allowPanAndZoom === true}
            onChange={handleSetPanZoom}
            type="checkbox"
            data-testid="geoAllowPanZoom"
          />
        </Form.Element>
        <Form.Element label="Latitude">
          <RangeSlider
            min={-90}
            max={90}
            value={props.center.lat}
            onChange={e => handleLatLongSelect(parseFloat(e.target.value))}
            testID="geoLatitude"
          />
        </Form.Element>
        <Form.Element label="Longitude">
          <RangeSlider
            min={-180}
            max={180}
            value={props.center.lon}
            onChange={e =>
              handleLatLongSelect(parseFloat(e.target.value), 'lon')
            }
            testID="geoLongitude"
          />
        </Form.Element>
        <Form.Element label="Zoom">
          <RangeSlider
            min={0}
            max={20}
            value={props.zoom}
            onChange={e => handleZoomSelect(parseFloat(e.target.value))}
            testID="geoZoom"
          />
        </Form.Element>
        {displayCustomOptions(props.layers[0].type)}
      </Grid.Column>
    </>
  )
}
export default GeoOptions
