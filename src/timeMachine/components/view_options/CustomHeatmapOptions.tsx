import React, {FC} from 'react'
import {getActiveTimeMachine} from 'src/timeMachine/selectors'
import {useSelector, useDispatch} from 'react-redux'
import {Form, RangeSlider} from '@influxdata/clockface'
import {setRadius} from 'src/timeMachine/actions/geoOptionsCreators'
import {GeoViewProperties} from 'src/client'

enum HeatMapRadiusMinMax {
  Min = 1,
  Max = 100,
}
const CustomHeatMapOptions: FC = () => {
  const {
    view: {properties},
  } = useSelector(getActiveTimeMachine)

  const geoViewProperties = properties as Partial<GeoViewProperties>

  const dispatch = useDispatch()

  const handleSetHeatmapRadius = (newRadius: number) => {
    if (geoViewProperties?.layers[0]?.radius) {
      dispatch(setRadius(newRadius))
    }
  }

  return (
    <Form.Element label="Radius" testID="heatmapradiusslider">
      <RangeSlider
        min={HeatMapRadiusMinMax.Min}
        max={HeatMapRadiusMinMax.Max}
        value={
          geoViewProperties.layers[0].radius ??
          Math.floor((HeatMapRadiusMinMax.Min + HeatMapRadiusMinMax.Max) / 2)
        }
        onChange={event =>
          handleSetHeatmapRadius(parseFloat(event.target.value))
        }
      />
    </Form.Element>
  )
}

export default CustomHeatMapOptions
