import React, {FC, useContext, useEffect} from 'react'
import VersionBullet from 'src/flows/components/header/VersionBullet'
import {VersionPublishContext} from 'src/flows/context/version.publish'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const PublishedVersions: FC = () => {
  const {versions, handleGetNotebookVersions} = useContext(
    VersionPublishContext
  )

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
