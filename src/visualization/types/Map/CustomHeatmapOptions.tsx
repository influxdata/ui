import React, {FC} from 'react'
import {Form, RangeSlider} from '@influxdata/clockface'
import {GeoViewProperties} from 'src/types'
import {VisualizationOptionProps} from 'src/visualization'

interface Props extends VisualizationOptionProps {
  properties: GeoViewProperties
}

enum HeatmapRadiusRange {
  Min = 1,
  Max = 100,
}
export const CustomHeatMapOptions: FC<Props> = ({properties, update}) => {
  const handleSetHeatmapRadius = (newRadius: number) => {
    if (properties?.layers[0]?.radius) {
      update({
        layers: [
          {
            ...properties.layers[0],
            radius: newRadius,
          },
          ...properties.layers.slice(1),
        ],
      })
    }
  }

  return (
    <Form.Element label="Radius" testID="geo-heatmap-radius-slider">
      <RangeSlider
        min={HeatmapRadiusRange.Min}
        max={HeatmapRadiusRange.Max}
        value={
          properties.layers[0].radius ??
          Math.floor((HeatmapRadiusRange.Min + HeatmapRadiusRange.Max) / 2)
        }
        onChange={event =>
          handleSetHeatmapRadius(parseFloat(event.target.value))
        }
      />
    </Form.Element>
  )
}
