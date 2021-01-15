import React, {FC} from 'react'
import {Columns, Grid} from '@influxdata/clockface'
import GraphTypeSwitcher from 'src/usage/GraphTypeSwitcher'

interface OwnProps {
  csv: string
  graphInfo: any
  widths: {
    XS: Columns
    SM: Columns
    MD: Columns
  }
}

const PanelSectionBody: FC<OwnProps> = ({csv, graphInfo, widths}) => (
  <Grid.Column
    widthXS={widths.XS}
    widthSM={widths.SM}
    widthMD={widths.MD}
    key={graphInfo.title}
  >
    <GraphTypeSwitcher graphInfo={graphInfo} csv={csv} />
  </Grid.Column>
)

export default PanelSectionBody
