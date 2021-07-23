import React, {FC, useEffect} from 'react'
import {ProgressBar, Gradients, InfluxColors} from '@influxdata/clockface'
import {
  BUCKET_LIMIT,
  RULE_LIMIT,
  TASK_LIMIT,
  DASHBOARD_LIMIT,
} from 'src/resources/constants'

const UsagePanel: FC = () => {
  useEffect(() => {
    console.log('Usage Panel')
  }, [])
  return (
    <div className="usagepanel--container">
      <ProgressBar
        value={50}
        max={BUCKET_LIMIT}
        barGradient={Gradients.SavannaHeat}
        color={InfluxColors.Ruby}
        label="Buckets"
      />
      <ProgressBar
        value={50}
        max={RULE_LIMIT}
        barGradient={Gradients.SavannaHeat}
        color={InfluxColors.Ruby}
        label="Rules"
      />
      <ProgressBar
        value={50}
        max={TASK_LIMIT}
        barGradient={Gradients.MillennialAvocado}
        color={InfluxColors.Rainforest}
        label="Tasks"
      />
      <ProgressBar
        value={50}
        max={DASHBOARD_LIMIT}
        barGradient={Gradients.GoldenHour}
        color={InfluxColors.Pineapple}
        label="Dashboards"
      />
    </div>
  )
}

export default UsagePanel
