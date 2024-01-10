// Libraries
import React, {FC, Fragment} from 'react'

// Components
import {
  Table,
  Button,
  ComponentColor,
  ComponentSize,
  Heading,
  HeadingElement,
  Alignment,
  Icon,
  IconFont,
  VerticalAlignment,
} from '@influxdata/clockface'

export const ProductComparisonTable: FC = () => {
  const comparisonTableContents = [
    {
      groupDetails: {
        title: 'Performance and scale',
        serverless: <></>,
        dedicated: <></>,
        clustered: <></>,
      },
      features: [
        {
          feature: 'Writes',
          serverless: <>5MB/5 mins (free) / 300MB/5 mins (paid)</>,
          dedicated: <>No applied service quota</>,
          clustered: <>Scalable</>,
        },
        {
          feature: 'Queries (data read)',
          serverless: <>300MB/5 mins (free) / 3000MB/5 mins (paid)</>,
          dedicated: <>No applied service quota</>,
          clustered: <>Scalable</>,
        },
        {
          feature: 'Data retention',
          serverless: <>30 days (free) / Unlimited (paid)</>,
          dedicated: <>Unlimited</>,
          clustered: <>Unlimited</>,
        },
        {
          feature: 'Cardinality',
          serverless: <>Contact sales about how to scale</>,
          dedicated: <>Unlimited</>,
          clustered: <>Unlimited</>,
        },
        {
          feature: 'Databases (buckets)',
          serverless: <>2 (free) / Unlimited (paid)</>,
          dedicated: <>Unlimited</>,
          clustered: <>Unlimited</>,
        },
        {
          feature: 'Notification rules',
          serverless: <>2 (free) / Unlimited (paid)</>,
          dedicated: <>N/A</>,
          clustered: <>N/A</>,
        },
        {
          feature: 'Multi-organization data access and management',
          serverless: <>1 (free) / 3 (pay-as-you-go) / 20 (annual plan)</>,
          dedicated: <>N/A</>,
          clustered: <>N/A</>,
        },
      ],
    },
    {
      groupDetails: {
        title: 'Operational efficiency',
        serverless: <></>,
        dedicated: <></>,
        clustered: <></>,
      },
      features: [
        {
          feature: 'Storage costs',
          serverless: <>90% lower than with InfluxDB OSS</>,
          dedicated: <>90% lower than with InfluxDB OSS</>,
          clustered: <>90% lower than with InfluxDB OSS</>,
        },
        {
          feature: 'Tiered storage',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <></>,
          clustered: <></>,
        },
      ],
    },
    {
      groupDetails: {
        title: 'Security and reliability',
        serverless: (
          <a href="https://www.influxdata.com/blog/influxdb-cloud-security-privacy/">
            See security details
          </a>
        ),
        dedicated: (
          <a href="https://www.influxdata.com/blog/influxdb-cloud-security-privacy/">
            See details
          </a>
        ),
        clustered: (
          <a href="https://www.influxdata.com/blog/influxdb-cloud-security-privacy/">
            See details
          </a>
        ),
      },
      features: [
        {
          feature: 'End-to-end encryption',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'SOC 2 Certified',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'ISO 27001/27018',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'Configurable for GDPR compliance',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'Disaster recovery support',
          serverless: <></>,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'Technical support SLA',
          serverless: <></>,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'Private networking',
          serverless: <></>,
          dedicated: <>Available as an add-on</>,
          clustered: <></>,
        },
        {
          feature: 'SAML/SSO',
          serverless: <></>,
          dedicated: 'Available as an add-on',
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'OAuth',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <></>,
          clustered: <></>,
        },
        {
          feature: 'Secrets',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <></>,
          clustered: <></>,
        },
        {
          feature: 'IdP integration',
          serverless: <></>,
          dedicated: <></>,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'Powerfull access control',
          serverless: <></>,
          dedicated: <></>,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'Audit logging for compliance',
          serverless: <></>,
          dedicated: <></>,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'High-available SLA guarantee',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <></>,
        },
      ],
    },
    {
      groupDetails: {
        title: 'Query languages',
        serverless: <></>,
        dedicated: <></>,
        clustered: <></>,
      },
      features: [
        {
          feature: 'SQL',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'InfluxQL',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'Flux',
          serverless: <></>,
          dedicated: <></>,
          clustered: <></>,
        },
      ],
    },
    {
      groupDetails: {
        title: 'Integrations',
        serverless: <></>,
        dedicated: <></>,
        clustered: <></>,
      },
      features: [
        {
          feature: 'Snowflake',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <></>,
          clustered: <></>,
        },
        {
          feature: 'Amazon AWS',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'Google Cloud Platform',
          serverless: <></>,
          dedicated: <></>,
          clustered: <></>,
        },
        {
          feature: 'Azure',
          serverless: <></>,
          dedicated: <></>,
          clustered: <></>,
        },
        {
          feature: 'Tableau',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'Superset',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'Grafana',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'Chronograf',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'Kapacitor',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <></>,
          clustered: <></>,
        },
        {
          feature: 'Telegraf',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'VS Code',
          serverless: <></>,
          dedicated: <></>,
          clustered: <></>,
        },
      ],
    },
    {
      groupDetails: {
        title: 'APIs',
        serverless: <></>,
        dedicated: <></>,
        clustered: <></>,
      },
      features: [
        {
          feature: 'v3 gRPC query',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'v1 HTTP write',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'v1 HTTP query',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'v2 HTTP write',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'v2 HTTP query',
          serverless: <></>,
          dedicated: <></>,
          clustered: <></>,
        },
      ],
    },
    {
      groupDetails: {
        title: 'Storage',
        serverless: <></>,
        dedicated: <></>,
        clustered: <></>,
      },
      features: [
        {
          feature: 'Apache Parquet',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
        {
          feature: 'S3 compatible object storage',
          serverless: <Icon glyph={IconFont.CheckMark_New} />,
          dedicated: <Icon glyph={IconFont.CheckMark_New} />,
          clustered: <Icon glyph={IconFont.CheckMark_New} />,
        },
      ],
    },
  ]

  return (
    <Table highlight>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell
            verticalAlignment={VerticalAlignment.Bottom}
          ></Table.HeaderCell>
          <Table.HeaderCell
            verticalAlignment={VerticalAlignment.Bottom}
            horizontalAlignment={Alignment.Center}
          >
            <Heading element={HeadingElement.H4}>
              InfluxDB Cloud Serverless
            </Heading>
            <Heading element={HeadingElement.P}>
              Smaller workloads, multi-tenant service
            </Heading>
            <Button
              text="Upgrade to Usage-Based"
              color={ComponentColor.Primary}
              size={ComponentSize.ExtraSmall}
            />
          </Table.HeaderCell>
          <Table.HeaderCell
            verticalAlignment={VerticalAlignment.Bottom}
            horizontalAlignment={Alignment.Center}
          >
            <Heading element={HeadingElement.H4}>
              InfluxDB Cloud Dedicated
            </Heading>
            <Heading element={HeadingElement.P}>
              Scaled workloads, on dedicated infrastructure
            </Heading>
            <Button
              text="Run a Proof of Concept"
              color={ComponentColor.Primary}
              size={ComponentSize.ExtraSmall}
            />
          </Table.HeaderCell>
          <Table.HeaderCell
            verticalAlignment={VerticalAlignment.Bottom}
            horizontalAlignment={Alignment.Center}
          >
            <Heading element={HeadingElement.H4}>
              InfluxDB Cloud Clustered
            </Heading>
            <Heading element={HeadingElement.P}>
              Scaled worloads, on-prem, private cloud, or hybrid
            </Heading>
            <Button
              text="Run a Proof of Concept"
              color={ComponentColor.Primary}
              size={ComponentSize.ExtraSmall}
            />
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {comparisonTableContents.map(group => (
          <Fragment key={group.groupDetails.title}>
            <Table.Row>
              <Table.HeaderCell verticalAlignment={VerticalAlignment.Bottom}>
                {group.groupDetails.title}
              </Table.HeaderCell>
              <Table.HeaderCell verticalAlignment={VerticalAlignment.Bottom}>
                {group.groupDetails.serverless}
              </Table.HeaderCell>
              <Table.HeaderCell verticalAlignment={VerticalAlignment.Bottom}>
                {group.groupDetails.dedicated}
              </Table.HeaderCell>
              <Table.HeaderCell verticalAlignment={VerticalAlignment.Bottom}>
                {group.groupDetails.clustered}
              </Table.HeaderCell>
            </Table.Row>
            {group.features.map(feature => (
              <Table.Row key={feature.feature}>
                <Table.Cell>{feature.feature}</Table.Cell>
                <Table.Cell horizontalAlignment={Alignment.Center}>
                  {feature.serverless}
                </Table.Cell>
                <Table.Cell horizontalAlignment={Alignment.Center}>
                  {feature.dedicated}
                </Table.Cell>
                <Table.Cell horizontalAlignment={Alignment.Center}>
                  {feature.clustered}
                </Table.Cell>
              </Table.Row>
            ))}
          </Fragment>
        ))}
      </Table.Body>
    </Table>
  )
}
