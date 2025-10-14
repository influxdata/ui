// Libraries
import React, {
  FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {useDispatch} from 'react-redux'
import {useParams} from 'react-router-dom'

// Context
import {FlowContext} from 'src/flows/context/flow.current'

// Utils
import {
  getNotebook,
  getNotebooksVersions,
  postNotebooksVersion,
  VersionHistories,
  VersionHistory,
} from 'src/client/notebooksRoutes'
import {notify} from 'src/shared/actions/notifications'
import {
  publishNotebookFailed,
  publishNotebookSuccessful,
} from 'src/shared/copy/notifications'
import {event} from 'src/cloud/utils/reporting'
import {getErrorMessage} from 'src/utils/api'

// Types
import {RemoteDataState} from 'src/types'
import {CLOUD} from '../../shared/constants'

interface ContextType {
  handlePublish: () => void
  publishLoading: RemoteDataState
  versions: VersionHistories
}

const DEFAULT_CONTEXT: ContextType = {
  handlePublish: () => {},
  publishLoading: RemoteDataState.NotStarted,
  versions: [],
}

export const VersionPublishContext = createContext<ContextType>(DEFAULT_CONTEXT)

export const VersionPublishProvider: FC = ({children}) => {
  // This flow is not the same as the draft notebook, it's the current versioned notebook
  const {flow} = useContext(FlowContext)
  const dispatch = useDispatch()
  const [versions, setVersions] = useState([])
  const [publishLoading, setPublishLoading] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )

  const {notebookID} = useParams<{notebookID: string}>()

  const handleGetNotebookVersions = useCallback(async () => {
    try {
      const response = await getNotebooksVersions({id: flow.id})

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      const resp = await getNotebook({id: notebookID ?? flow.id})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      const versions: VersionHistory[] = response.data.reverse()

      if (resp.data.isDirty) {
        versions.unshift({
          id: 'draft',
          publishedAt: resp.data.updatedAt,
          publishedBy: null,
        })
      }

      setVersions(versions)
    } catch (error) {
      console.error({error})
    }
  }, [flow.id, notebookID])

  useEffect(() => {
    if (CLOUD) {
      handleGetNotebookVersions()
    }
  }, [handleGetNotebookVersions])

  const handlePublish = useCallback(async () => {
    try {
      event('publish_notebook')
      const response = await postNotebooksVersion({id: flow.id})

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      dispatch(notify(publishNotebookSuccessful(flow.name)))
      setPublishLoading(RemoteDataState.Done)
      handleGetNotebookVersions()
    } catch (error) {
      dispatch(notify(publishNotebookFailed(flow.name, getErrorMessage(error))))
      setPublishLoading(RemoteDataState.Error)
    }
  }, [dispatch, handleGetNotebookVersions, flow.id, flow.name])

  return (
    <VersionPublishContext.Provider
      value={{
        handlePublish,
        publishLoading,
        versions,
      }}
    >
      {children}
    </VersionPublishContext.Provider>
  )
}
