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

// Context
import {FlowContext} from 'src/flows/context/flow.current'

// Utils
import {
  getNotebooksVersions,
  postNotebooksVersion,
  VersionHistories,
  VersionHistory,
} from 'src/client/notebooksRoutes'
import {Flow} from 'src/types'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {notify} from 'src/shared/actions/notifications'
import {
  publishNotebookFailed,
  publishNotebookSuccessful,
} from 'src/shared/copy/notifications'

// Types
import {RemoteDataState} from 'src/types'

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
  const {flow} = useContext(FlowContext)
  const dispatch = useDispatch()
  const [versions, setVersions] = useState([])
  const [publishLoading, setPublishLoading] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )

  const handleGetNotebookVersions = useCallback(async () => {
    try {
      const response = await getNotebooksVersions({id: flow.id})

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      const versions: (VersionHistory | Flow)[] = response.data.reverse()
      // TODO(ariel): follow up on this so that we get the fresh flow too
      if (flow.isDirty) {
        versions.unshift(flow)
      }

      setVersions(versions)
    } catch (error) {
      console.error({error})
    }
  }, [flow])

  useEffect(() => {
    if (isFlagEnabled('flowPublishLifecycle')) {
      handleGetNotebookVersions()
    }
  }, [handleGetNotebookVersions])

  const handlePublish = useCallback(async () => {
    try {
      const response = await postNotebooksVersion({id: flow.id})

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      dispatch(notify(publishNotebookSuccessful(flow.name)))
      setPublishLoading(RemoteDataState.Done)
      handleGetNotebookVersions()
    } catch (error) {
      dispatch(notify(publishNotebookFailed(flow.name)))
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
