import React, {FC, useContext} from 'react'
import VersionBullet from 'src/flows/components/header/VersionBullet'
import {VersionPublishContext} from 'src/flows/context/version.publish'

const PublishedVersions: FC = () => {
  const {versions} = useContext(VersionPublishContext)

  if (versions.length === 0) {
    return null
  }

  return (
    <>
      <VersionBullet draftVersion />
      {versions.map(version => (
        <VersionBullet key={version.id} version={version} />
      ))}
    </>
  )
}

export default PublishedVersions
