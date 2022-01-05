// Libraries
import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'

// Utils
import {pageTitleSuffixer} from '../shared/utils/pageTitles'
import * as api from '../client'
import {parseASTIM} from '../buckets/utils/astim'

// Components
import {Page} from '@influxdata/clockface'
import DashboardsHealth from './Dashboards/DashboardsHealth'
import {Dashboard as GenDashboard} from '../client'

// selectors
import {getOrg} from '../organizations/selectors'

const HealthPage = () => {
  const [dashboards, setDashboards] = useState([])

  const org = useSelector(getOrg)

  useEffect(() => {
    // get all buckets
    api
      .getBuckets({
        query: {
          orgID: org.id,
        },
      })
      .then(result => {
        const buckets = result.data['buckets'].reduce((o, bucket) => ({
          ...o,
          [bucket.name]: true,
        }))

        // get all dashboards
        api
          .getDashboards({
            query: {
              orgID: org.id,
            },
          })
          .then(result => {
            parseDashboards(buckets, result.data['dashboards'])
          })
      })
  }, [org.id])

  const parseDashboards = async (buckets: {}, dashboards: GenDashboard[]) => {
    const results = []
    for (const dashboard of dashboards) {
      const dashboardDetails = {
        name: dashboard.name,
        cells: [],
        healthy: true,
      }

      // For every cell in the dashboard, load the queries and verify
      // if the bucket in every query points to a valid bucket
      for (const cell of dashboard.cells) {
        await fetch(cell.links.view)
          .then(result => result.json())
          .then(cellView => {
            const {queries} = cellView.properties

            const missingBuckets = queries?.reduce((accum, query) => {
              const {bucketNames: names} = parseASTIM(query.text)
              const missingBucketsInQuery = names.filter(
                name => buckets[name] === undefined
              )
              accum.push(...missingBucketsInQuery)
              return accum
            }, [])

            const uniqueMissingBuckets = [...new Set(missingBuckets)]
            dashboardDetails.cells.push({
              name: cell.name,
              missingBuckets: uniqueMissingBuckets,
            })
            dashboardDetails.healthy =
              dashboardDetails.healthy && uniqueMissingBuckets.length === 0
          })
      }

      results.push(dashboardDetails)
    }
    setDashboards(results)
  }

  return (
    <>
      <Page titleTag={pageTitleSuffixer(['Health Page'])}>
        <Page.Header fullWidth={false} testID="health-check-page--header">
          <Page.Title title="Dashboards health" />
        </Page.Header>
        <Page.Contents scrollable={true}>
          {dashboards.length > 0 ? (
            <DashboardsHealth dashboards={dashboards} />
          ) : null}
        </Page.Contents>
      </Page>
    </>
  )
}

export default HealthPage
