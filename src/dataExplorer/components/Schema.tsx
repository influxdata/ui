import React, {FC, useState, useContext, useMemo} from 'react'

// Components
import {DapperScrollbars} from '@influxdata/clockface'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import BucketSelector from 'src/dataExplorer/components/BucketSelector'
import MeasurementSelector from 'src/dataExplorer/components/MeasurementSelector'
import FieldsSelector from 'src/dataExplorer/components/FieldsSelector'
import TagKeysSelector from 'src/dataExplorer/components/TagKeysSelector'
import {NewDataExplorerProvider} from 'src/dataExplorer/context/newDataExplorer'
import WaitingText from 'src/shared/components/WaitingText'

// Context
import {NewDataExplorerContext} from 'src/dataExplorer/context/newDataExplorer'

// Types
import {RemoteDataState} from 'src/types'

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
    if (!data?.measurement) {
      return null
    }

    if (loading === RemoteDataState.Loading) {
      return <WaitingText text="Loading" />
    }

    return (
      <div>
        <div className="fields-tags-search-bar">
          <SearchWidget
            placeholderText="Search fields and tags"
            onSearch={handleSearchFieldsTags}
            searchTerm={searchTerm}
          />
        </div>
        <FieldsSelector />
        <TagKeysSelector />
      </div>
    )
  }, [loading, data?.measurement])
}

const Schema: FC = () => {
  return (
    <NewDataExplorerProvider>
      <div>
        <div className="data-selection--title">Data Selection</div>
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
      </div>
    </NewDataExplorerProvider>
  )
}

export default Schema
