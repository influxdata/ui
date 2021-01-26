import React, {FC} from 'react'
import {useDispatch} from 'react-redux'
import {
  setLatitude,
  setLongitude,
  setAllowPanAndZoom,
  setZoomValue,
  setMapType,
} from 'src/timeMachine/actions'
import {GeoViewProperties} from 'src/client'
import {Grid, SelectGroup, Form, RangeSlider} from '@influxdata/clockface'
import {invert} from 'lodash'
const selectOptions = ['Point', 'Circle', 'Heat', 'Track']
const selectHash = {
  pointMap: 'Point',
  circleMap: 'Circle',
  heatmap: 'Heat',
  trackMap: 'Track',
}
const GeoOptions: FC<GeoViewProperties> = props => {
  const dispatch = useDispatch()
  const handleSelectGroupClick = (activeOption: string): void => {
    console.log(invert(selectHash)[activeOption])
    dispatch(setMapType(invert(selectHash)[activeOption]))
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
      >
        {selectOptions.map((s: string, i: number) => (
          <SelectGroup.Option
            key={i}
            id={s}
            name="selectOptions"
            value={s}
            active={props.layers[0].type === invert(selectHash)[s]}
            onClick={handleSelectGroupClick}
            tabIndex={i + 1}
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
          />
        </Form.Element>
        <Form.Element label="Latitude">
          <RangeSlider
            min={-90}
            max={90}
            value={props.center.lat}
            onChange={e => handleLatLongSelect(parseFloat(e.target.value))}
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
          />
        </Form.Element>
        <Form.Element label="Zoom">
          <RangeSlider
            min={0}
            max={20}
            value={props.zoom}
            onChange={e => handleZoomSelect(parseFloat(e.target.value))}
          />
        </Form.Element>
      </Grid.Column>
    </>
  )
}
export default GeoOptions
