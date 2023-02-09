import React, {FC} from 'react'

// Components
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Icon,
  IconFont,
  ResourceCard,
} from '@influxdata/clockface'

// Utils
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

type Props = {
  wizardEventName: string
  handleNextStepEvent: (wizardEventName: string, nextStepName: string) => void
}

const DashboardIntegrations: FC<Props> = ({
  wizardEventName,
  handleNextStepEvent,
}) => {
  return (
    <FlexBox
      margin={ComponentSize.Large}
      alignItems={AlignItems.Stretch}
      direction={FlexDirection.Row}
    >
      <ResourceCard className="homepage-wizard-next-steps">
        <SafeBlankLink
          href="https://docs.influxdata.com/influxdb/cloud-iox/visualize-data/superset/"
          onClick={() =>
            handleNextStepEvent(wizardEventName, 'supersetIntegration')
          }
        >
          <h4>
            <Icon glyph={IconFont.DashH} />
            Integrate with Supserset
          </h4>
        </SafeBlankLink>
        <p>Create dashboards and alerts with Apache Superset.</p>
      </ResourceCard>
      <ResourceCard className="homepage-wizard-next-steps">
        <SafeBlankLink
          href="https://docs.influxdata.com/influxdb/cloud-iox/visualize-data/grafana/"
          onClick={() =>
            handleNextStepEvent(wizardEventName, 'grafanaIntegration')
          }
        >
          <h4>
            <Icon glyph={IconFont.DashH} />
            Integrate with Grafana
          </h4>
        </SafeBlankLink>
        <p>Create dashboards and alerts with Grafana.</p>
      </ResourceCard>
    </FlexBox>
  )
}

export default DashboardIntegrations
