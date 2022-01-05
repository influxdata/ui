import NotebooksHealth from './NotebooksHealth'
import {
  EmptyState,
  EmptyStateText,
  RemoteDataState,
  SparkleSpinner,
} from '@influxdata/clockface'
import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {getOrg} from '../../organizations/selectors'
import * as api from '../../client'
import * as notebookAPI from 'src/client/notebooksRoutes'
import {Notebook as GenNotebook} from 'src/client/notebooksRoutes'
import {parseASTIM} from '../../buckets/utils/astim'

const DashboardsHealthTab = () => {
  const [notebooks, setNotebooks] = useState([])
  const [notebooksLoaded, setNotebooksLoaded] = useState(false)

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

        // get all notebooks
        notebookAPI
          .getNotebooks({
            query: {
              orgID: org.id,
            },
          })
          .then(result => {
            console.log(result)
            parseNotebooks(buckets, result.data['flows'])
          })
      })
  }, [org.id])

  const parseNotebooks = async (buckets: {}, notebooks: GenNotebook[]) => {
    const results = []
    for (const notebook of notebooks) {
      const notebookDetails = {
        name: notebook.name,
        healthy: true,
        id: notebook.id,
        flows: [],
      }

      // For every cell in the notebook, load the queries and verify
      // if the bucket in every query points to a valid bucket
      for (const pipe of notebook.spec.pipes) {
        console.log(pipe)
        let uniqueMissingBuckets = []
        switch (pipe.type) {
          case 'rawFluxEditor':
            const queries = pipe.queries
            const missingBuckets = queries?.reduce((accum, query) => {
              const {bucketNames: names} = parseASTIM(query.text)
              const missingBucketsInQuery = names.filter(
                name => buckets[name] === undefined
              )
              accum.push(...missingBucketsInQuery)
              return accum
            }, [])

            uniqueMissingBuckets = [...new Set(missingBuckets)]
            notebookDetails.flows.push({
              // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              // @ts-ignore
              title: pipe.title,
              missingBuckets: uniqueMissingBuckets,
            })
            notebookDetails.healthy =
              notebookDetails.healthy && uniqueMissingBuckets.length === 0
            break

          case 'queryBuilder':
            const bucketNames = []
            pipe.buckets.forEach(bucket => bucketNames.push(bucket.name))

            const missingBucketsInQuery = bucketNames.filter(
              name => buckets[name] === undefined
            )
            uniqueMissingBuckets = [...new Set(missingBucketsInQuery)]

            notebookDetails.flows.push({
              // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              // @ts-ignore
              title: pipe.title,
              missingBuckets: uniqueMissingBuckets,
            })
            notebookDetails.healthy =
              notebookDetails.healthy && uniqueMissingBuckets.length === 0
            break
        }
      }

      results.push(notebookDetails)
    }
    setNotebooks(results)
    setNotebooksLoaded(true)
  }

  return (
    <>
      {!notebooksLoaded ? (
        <EmptyState>
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <SparkleSpinner loading={RemoteDataState.Loading} />
          </div>
          <EmptyStateText>Analyzing ... </EmptyStateText>
        </EmptyState>
      ) : null}

      {notebooks.length > 0 ? <NotebooksHealth notebooks={notebooks} /> : null}

      {notebooksLoaded &&
      Object.values(notebooks).every(item => item.healthy === true) ? (
        <EmptyState>
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <SparkleSpinner loading={RemoteDataState.Done} />
          </div>
          <EmptyStateText>No illegal references found!</EmptyStateText>
        </EmptyState>
      ) : null}
    </>
  )
}

export default DashboardsHealthTab
