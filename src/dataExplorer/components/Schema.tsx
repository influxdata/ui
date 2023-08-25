import React, {FC, useCallback, useContext, useEffect, useMemo} from 'react'
import {useSelector} from 'react-redux'

// Components
import {DapperScrollbars} from '@influxdata/clockface'
import {SearchWidget} from 'src/shared/components/search_widget/SearchWidget'
import {BucketSelector} from 'src/dataExplorer/components/BucketSelector'
import {MeasurementSelector} from 'src/dataExplorer/components/MeasurementSelector'
import FieldSelector from 'src/dataExplorer/components/FieldSelector'
import TagSelector from 'src/dataExplorer/components/TagSelector'
import SchemaBrowserHeading from 'src/dataExplorer/components/SchemaBrowserHeading'
import {DBRPSelector} from 'src/dataExplorer/components/DBRPSelector'

// Context
import {
  ScriptQueryBuilderContext,
  ScriptQueryBuilderProvider,
} from 'src/dataExplorer/context/scriptQueryBuilder'
import {BucketProvider} from 'src/shared/contexts/buckets'
import {MeasurementsProvider} from 'src/dataExplorer/context/measurements'
import {FieldsProvider} from 'src/dataExplorer/context/fields'
import {TagsProvider} from 'src/dataExplorer/context/tags'

// Types
import {QueryScope} from 'src/shared/contexts/query'

// Utils
import {getOrg} from 'src/organizations/selectors'

// Style
import './Schema.scss'

const FieldsTags: FC = () => {
  const {selectedBucket, selectedMeasurement, searchTerm, setSearchTerm} =
    useContext(ScriptQueryBuilderContext)

  useEffect(() => {
    setSearchTerm('')
    // setSearchTerm will cause infinite re-rendering if added to the dependency list
  }, [selectedBucket, selectedMeasurement]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchFieldsTags = useCallback(
    (searchTerm: string): void => {
      setSearchTerm(searchTerm)
    },
    [setSearchTerm]
  )

  return useMemo(() => {
    if (!selectedBucket || !selectedMeasurement) {
      return null
    }

    return (
      <div className="container-side-bar">
        <SearchWidget
          placeholderText="Search fields and tag keys"
          onSearch={handleSearchFieldsTags}
          searchTerm={searchTerm}
          testID="field-tag-key-search-bar"
        />
        <FieldSelector />
        <TagSelector />
      </div>
    )
  }, [selectedBucket, selectedMeasurement, searchTerm, handleSearchFieldsTags])
}

const Schema: FC = () => {
  const org = useSelector(getOrg)
  const scope = {
    org: org.id,
    region: window.location.origin,
  } as QueryScope

  return (
    <MeasurementsProvider scope={scope}>
      <FieldsProvider scope={scope}>
        <TagsProvider scope={scope}>
          <ScriptQueryBuilderProvider>
            <BucketProvider scope={scope} omitSampleData>
              {/* DBRPProvider is in upstream */}
              <div className="scroll--container">
                <DapperScrollbars>
                  <div className="schema-browser" data-testid="schema-browser">
                    <SchemaBrowserHeading />
                    <BucketSelector />
                    <DBRPSelector />
                    <div className="container-side-bar">
                      <MeasurementSelector />
                      <FieldsTags />
                    </div>
                  </div>
                </DapperScrollbars>
              </div>
            </BucketProvider>
          </ScriptQueryBuilderProvider>
        </TagsProvider>
      </FieldsProvider>
    </MeasurementsProvider>
  )
}

export {Schema}
