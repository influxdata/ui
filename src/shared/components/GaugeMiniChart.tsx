// Libraries
import React, { FunctionComponent } from 'react'
import _ from 'lodash'
import {AutoSizer} from 'react-virtualized'
import { GaugeMiniLayerConfig } from "@influxdata/giraffe"
import { GAUGE_MINI_THEME_BULLET_DARK } from "../constants/gaugeMiniSpecs"
import { GaugeMini } from "./GaugeMini"

// Components

// Types

// Constants


interface Props {
  values: {colsMString: string; value: number}[]
  theme: GaugeMiniLayerConfig
}

const GaugeMiniChart: FunctionComponent<Props> = (props: Props) => {
  const {theme, values} = props
  const themeOrDefault: Required<GaugeMiniLayerConfig> = {
    ...GAUGE_MINI_THEME_BULLET_DARK,
    ...theme,
    ...((theme as any) ? {gaugeColors : (theme as any).colors} : {}),
  }

  return (
    <AutoSizer className="giraffe-autosizer">
      {({width, height}) => (
        <div
          className="giraffe-layer giraffe-layer-gauge-mini"
          data-testid="giraffe-layer-gauge-mini"
        >
          <GaugeMini
            width={width}
            height={height}
            values={values}
            theme={themeOrDefault}
          />
        </div>
      )}
    </AutoSizer>
  )
}

export default GaugeMiniChart
