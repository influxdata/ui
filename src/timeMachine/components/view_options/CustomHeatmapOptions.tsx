import React, {FC} from 'react'
import {getActiveTimeMachine} from 'src/timeMachine/selectors'
import {useSelector, useDispatch} from 'react-redux'
import {Form, RangeSlider} from '@influxdata/clockface'
import {setRadius} from 'src/timeMachine/actions'
import {GeoViewProperties} from 'src/client'
const CustomHeatMapOptions: FC = () => {
  const {
    view: {properties},
  } = useSelector(getActiveTimeMachine)

  const newProps = properties as Partial<GeoViewProperties>

  const dispatch = useDispatch()

  const handleSetHeatmapRadius = (radius: number) => {
    dispatch(setRadius(radius))
  }

  return (
    <Form.Element label="Radius" testID="heatmapradiusslider">
      <RangeSlider
        min={1}
        max={100}
        value={newProps.layers[0].radius}
        onChange={e => handleSetHeatmapRadius(parseFloat(e.target.value))}
      />
    </Form.Element>
  )
}

export default CustomHeatMapOptions
