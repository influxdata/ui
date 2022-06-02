import React, {FC, useContext, useMemo} from 'react'
import {useSelector} from 'react-redux'

// Components
import {DapperScrollbars} from '@influxdata/clockface'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import BucketSelector from 'src/dataExplorer/components/BucketSelector'
import MeasurementSelector from 'src/dataExplorer/components/MeasurementSelector'
import FieldSelector from 'src/dataExplorer/components/FieldSelector'
import TagSelector from 'src/dataExplorer/components/TagSelector'

// Context
import {
  FluxQueryBuilderContext,
  NewDataExplorerProvider,
} from 'src/dataExplorer/context/fluxQueryBuilder'
import QueryProvider from 'src/shared/contexts/query'
import {BucketProvider} from 'src/shared/contexts/buckets'
import {MeasurementsProvider} from 'src/dataExplorer/context/measurements'
import {FieldsProvider} from 'src/dataExplorer/context/fields'
import {TagsProvider} from 'src/dataExplorer/context/tags'

// Types
import {QueryScope} from 'src/types'

// Utils
import {getOrg} from 'src/organizations/selectors'

// Style
import './Schema.scss'

const FieldsTags: FC = () => {
  const {
    selectedBucket,
    selectedMeasurement,
    searchTerm,
    setSearchTerm,
  } = useContext(FluxQueryBuilderContext)

  const handleSearchFieldsTags = (searchTerm: string): void => {
    setSearchTerm(searchTerm)
  }

  return useMemo(() => {
    if (!selectedBucket || !selectedMeasurement) {
      return null
    }

    return (
      <div className="container-side-bar">
        <SearchWidget
          placeholderText="Search fields and tags"
          onSearch={handleSearchFieldsTags}
          searchTerm={searchTerm}
        />
        <FieldSelector />
        <TagSelector />
      </div>
    )
  }, [selectedBucket, selectedMeasurement])
}

const Schema: FC = () => {
  const org = useSelector(getOrg)
  const scope = {
    org: org.id,
    region: window.location.origin,
  } as QueryScope

  return (
    <QueryProvider>
      <MeasurementsProvider scope={scope}>
        <FieldsProvider scope={scope}>
          <TagsProvider scope={scope}>
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
          </TagsProvider>
        </FieldsProvider>
      </MeasurementsProvider>
    </QueryProvider>
  )
}

export default Schema
