import React, {FC, useState, useContext, useMemo} from 'react'
import {useSelector} from 'react-redux'

// Components
import {DapperScrollbars} from '@influxdata/clockface'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import BucketSelector from 'src/dataExplorer/components/BucketSelector'
import MeasurementSelector from 'src/dataExplorer/components/MeasurementSelector'
import FieldSelector from 'src/dataExplorer/components/FieldSelector'
import TagSelector from 'src/dataExplorer/components/TagSelector'
import {NewDataExplorerProvider} from 'src/dataExplorer/context/newDataExplorer'
import WaitingText from 'src/shared/components/WaitingText'

// Context
import {NewDataExplorerContext} from 'src/dataExplorer/context/newDataExplorer'
import {BucketProvider} from 'src/shared/contexts/buckets'

// Types
import {RemoteDataState, QueryScope} from 'src/types'

// Utils
import {getOrg} from 'src/organizations/selectors'

// Style
import './Schema.scss'

const FieldsTags: FC = () => {
  const {loading, data} = useContext(NewDataExplorerContext)

  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchFieldsTags = (searchTerm: string): void => {
    // TODO
    /* eslint-disable no-console */
    console.log('Search: ', searchTerm)
    /* eslint-disable no-console */
    setSearchTerm(searchTerm)
  }

  return useMemo(() => {
    if (!data?.bucket || !data?.measurement) {
      return null
    }

    if (loading === RemoteDataState.Loading) {
      return <WaitingText text="Loading" />
    }

    return (
      <div className="container-side-bar">
        <SearchWidget
          placeholderText="Search fields and tags..."
          onSearch={handleSearchFieldsTags}
          searchTerm={searchTerm}
        />
        <FieldSelector />
        <TagSelector />
      </div>
    )
  }, [loading, data])
}

const Schema: FC = () => {
  const org = useSelector(getOrg)
  const scope = {
    org: org.id,
    region: window.location.origin,
  } as QueryScope

  return (
    <NewDataExplorerProvider>
      <BucketProvider scope={scope}>
        <div className="scroll--container">
          <DapperScrollbars>
            <div className="data-schema">
              <BucketSelector />
              <div className="container-side-bar">
                <MeasurementSelector />
                <FieldsTags />
              </div>
            </div>
          </DapperScrollbars>
        </div>
      </BucketProvider>
    </NewDataExplorerProvider>
  )
}

export default Schema
