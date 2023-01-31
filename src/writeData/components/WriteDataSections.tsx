// Libraries
import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'

// Contexts
import {WriteDataSearchContext} from 'src/writeData/containers/WriteDataPage'

// Constants
import {search as searchUploads} from 'src/writeData/constants/contentFileUploads'
import {search as searchPlugins} from 'src/writeData/constants/contentTelegrafPlugins'
import {searchClients} from 'src/writeData'
import {CLOUD} from 'src/shared/constants'

// Components
import {EmptyState, ComponentSize} from '@influxdata/clockface'
import FileUploadSection from 'src/writeData/components/FileUploadSection'
import ClientLibrarySection from 'src/writeData/components/ClientLibrarySection'
import ClientLibrarySectionSql from './ClientLibrarySectionSql'
import TelegrafPluginSection from 'src/writeData/components/TelegrafPluginSection'
import CloudNativeSources from 'src/writeData/subscriptions/components/CloudNativeSources'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {isOrgIOx} from 'src/organizations/selectors'

const WriteDataSections: FC = () => {
  const {searchTerm} = useContext(WriteDataSearchContext)
  const isIOxOrg = useSelector(isOrgIOx)
  const hasResults =
    !!searchUploads(searchTerm).length ||
    !!searchClients(searchTerm).length ||
    !!searchPlugins(searchTerm).length

  if (!hasResults) {
    return (
      <EmptyState size={ComponentSize.Large}>
        <h4>
          Nothing matched <strong>{`"${searchTerm}"`}</strong>
        </h4>
      </EmptyState>
    )
  }

  return (
    <>
      <FileUploadSection />
      {isIOxOrg ? (
        <ClientLibrarySectionSql />
      ) : (
        <ClientLibrarySection />
      )}
      {CLOUD && isFlagEnabled('subscriptionsUI') && <CloudNativeSources />}
      <TelegrafPluginSection />
    </>
  )
}

export default WriteDataSections
