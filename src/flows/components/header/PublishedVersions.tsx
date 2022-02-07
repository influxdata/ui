import React, {FC, useCallback, useContext, useEffect, useState} from 'react'
import VersionBullet from 'src/flows/components/header/VersionBullet'
import {FlowContext} from 'src/flows/context/flow.current'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {
  getNotebooksVersions,
  VersionHistories,
} from 'src/client/notebooksRoutes'

const PublishedVersions: FC = () => {
  const {flow} = useContext(FlowContext)
  const [versions, setVersions] = useState<VersionHistories>([])

  const handleGetNotebookVersions = useCallback(async () => {
    try {
      const response = await getNotebooksVersions({id: flow.id})

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      setVersions(response.data)
    } catch (error) {
      console.error({error})
    }
  }, [flow])

  useEffect(() => {
    if (isFlagEnabled('flowPublishLifecycle')) {
      handleGetNotebookVersions()
    }
  }, [handleGetNotebookVersions])

  if (versions.length === 0) {
    return null
  }

  return (
    <>
      {versions.map(version => (
        <VersionBullet key={version.id} version={version} />
      ))}
    </>
  )
}

export default PublishedVersions
