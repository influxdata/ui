import React, {FC} from 'react'
import {Grid} from '@influxdata/clockface'
import GraphTypeSwitcher from 'src/usage/GraphTypeSwitcher'
import {Table} from '@influxdata/giraffe'

interface OwnProps {
  table: Table
  status: string
  graphInfo: any
  widths: any
}

const PanelSectionBody: FC<OwnProps> = ({table, status, graphInfo, widths}) => {
  return (
    <Grid.Column
      widthXS={widths.XS}
      widthSM={widths.SM}
      widthMD={widths.MD}
      key={graphInfo.title}
    >
      <GraphTypeSwitcher graphInfo={graphInfo} table={table} status={status} />
    </Grid.Column>
  )
}

export default PanelSectionBody
