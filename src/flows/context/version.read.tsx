import React, {FC, useCallback, useEffect, useState} from 'react'
import {FlowContext} from 'src/flows/context/flow.current'
import {useParams} from 'react-router'
import PageSpinner from 'src/perf/components/PageSpinner'

import {RemoteDataState} from 'src/types'
import {getNotebooksVersion} from 'src/client/notebooksRoutes'
import {hydrate} from 'src/flows/context/flow.list'

export const VersionFlowProvider: FC = ({children}) => {
  const [flow, setFlow] = useState(null)
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const {notebookID, id} = useParams<{notebookID: string; id: string}>()

  const getNotebooksByVersion = useCallback(async () => {
    try {
      const response = await getNotebooksVersion({
        notebookID,
        id,
      })
      if (response.status !== 200) {
        throw new Error(response.data.message)
      }
      // TODO(ariel): update the definition to match the API
      setFlow(hydrate((response.data as any).notebookVersion))
      setLoading(RemoteDataState.Done)
    } catch (error) {
      console.error({error})
      setLoading(RemoteDataState.Error)
    }
  }, [id, notebookID])

  useEffect(() => {
    getNotebooksByVersion()
  }, [getNotebooksByVersion])

  return (
    <PageSpinner loading={loading}>
      <FlowContext.Provider
        value={{
          flow,
          add: (_, __) => '',
          cloneNotebook: () => {},
          deleteNotebook: () => {},
          remove: () => '',
          updateData: _ => {},
          updateMeta: _ => {},
          updateOther: _ => {},
          populate: _ => {},
        }}
      >
        {children}
      </FlowContext.Provider>
    </PageSpinner>
  )
}
