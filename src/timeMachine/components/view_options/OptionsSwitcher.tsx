// Libraries
import React, {PureComponent} from 'react'

// Components
import BandOptions from 'src/timeMachine/components/view_options/BandOptions'
import LineOptions from 'src/timeMachine/components/view_options/LineOptions'
import GaugeOptions from 'src/timeMachine/components/view_options/GaugeOptions'
import SingleStatOptions from 'src/timeMachine/components/view_options/SingleStatOptions'
import TableOptions from 'src/timeMachine/components/view_options/TableOptions'
import HistogramOptions from 'src/timeMachine/components/view_options/HistogramOptions'
import HeatmapOptions from 'src/timeMachine/components/view_options/HeatmapOptions'
import ScatterOptions from 'src/timeMachine/components/view_options/ScatterOptions'
import MosaicOptions from 'src/timeMachine/components/view_options/MosaicOptions'

// Types
import {View, NewView} from 'src/types'

interface Props {
  view: View | NewView
}

class OptionsSwitcher extends PureComponent<Props> {
  public render() {
    const {view} = this.props

    switch (view.properties.type) {
      case 'line-plus-single-stat':
        return (
          <>
            <LineOptions {...view.properties} />
            <SingleStatOptions />
          </>
        )
      case 'xy':
        return <LineOptions {...view.properties} />
      case 'band':
        return <BandOptions {...view.properties} />
      case 'gauge':
        return <GaugeOptions {...view.properties} />
      case 'single-stat':
        return <SingleStatOptions />
      case 'table':
        return <TableOptions />
      case 'histogram':
        return <HistogramOptions {...view.properties} />
      case 'heatmap':
        return <HeatmapOptions {...view.properties} />
      case 'scatter':
        return <ScatterOptions {...view.properties} />
      case 'mosaic':
        return <MosaicOptions {...view.properties} />
      default:
        return <div />
    }
  }
}

export default OptionsSwitcher
