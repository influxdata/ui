import DashboardsHealth from './DashboardsHealth'
import {EmptyState, EmptyStateText, RemoteDataState, SparkleSpinner} from '@influxdata/clockface'
import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {getOrg} from '../../organizations/selectors'
import * as api from '../../client'
import {Dashboard as GenDashboard} from '../../client'
import {parseASTIM} from '../../buckets/utils/astim'

const DashboardsHealthTab = () => {
  const [dashboards, setDashboards] = useState([])
  const [dashboardsLoaded, setDashboardsLoaded] = useState(false)

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
        id: dashboard.id
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
              // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              // @ts-ignore
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
    setDashboardsLoaded(true)
  }

  return (
    <>
      {!dashboardsLoaded ?
        <EmptyState>
        <div style={{display: 'flex', justifyContent: 'center'}}><SparkleSpinner loading={RemoteDataState.Loading}/></div>
        <EmptyStateText>Analyzing ... </EmptyStateText>
      </EmptyState> : null}

      {dashboards.length > 0 ? (
        <DashboardsHealth dashboards={dashboards} />
      ) : null}

      {(dashboardsLoaded &&
      Object.values(dashboards).every(item => item.healthy === true)) ? (
        <EmptyState>
          <div style={{display: 'flex', justifyContent: 'center'}}><SparkleSpinner loading={RemoteDataState.Done}/></div>
          <EmptyStateText>No illegal references found!</EmptyStateText>
        </EmptyState>
      ) : null}
    </>
  )
}

export default DashboardsHealthTab
