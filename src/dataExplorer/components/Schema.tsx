import React, {FC, useContext, useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'

// Components
import {
  DapperScrollbars,
  FlexBox,
  InputLabel,
  SlideToggle,
  JustifyContent,
  QuestionMarkTooltip,
} from '@influxdata/clockface'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import BucketSelector from 'src/dataExplorer/components/BucketSelector'
import MeasurementSelector from 'src/dataExplorer/components/MeasurementSelector'
import FieldSelector from 'src/dataExplorer/components/FieldSelector'
import TagSelector from 'src/dataExplorer/components/TagSelector'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'

// Context
import {
  FluxQueryBuilderContext,
  FluxQueryBuilderProvider,
} from 'src/dataExplorer/context/fluxQueryBuilder'
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

const FLUX_SYNC_TOOLTIP = `Flux Sync autopopulates the script editor to help you \
start a query. You can turn this feature on and off, but typing within this \
section will disable synchronization.`

const Heading: FC = () => {
  const [fluxSyncOn, setFluxSyncOn] = useState(true)

  const handleFluxSyncToggle = () => {
    setFluxSyncOn(!fluxSyncOn)
  }

  return (
    <FlexBox justifyContent={JustifyContent.SpaceBetween}>
      <div>Schema Browser</div>
      <FlexBox>
        <SlideToggle active={fluxSyncOn} onChange={handleFluxSyncToggle} />
        <InputLabel>
          <SelectorTitle title="Flux Sync" info={FLUX_SYNC_TOOLTIP} />
        </InputLabel>
      </FlexBox>
    </FlexBox>
  )
}

const FieldsTags: FC = () => {
  const {
    selectedBucket,
    selectedMeasurement,
    searchTerm,
    setSearchTerm,
  } = useContext(FluxQueryBuilderContext)

  useEffect(() => {
    setSearchTerm('')
  }, [selectedBucket, selectedMeasurement])

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
          placeholderText="Search fields and tag keys"
          onSearch={handleSearchFieldsTags}
          searchTerm={searchTerm}
          testID="field-tag-key-search-bar"
        />
        <FieldSelector />
        <TagSelector />
      </div>
    )
  }, [selectedBucket, selectedMeasurement, searchTerm])
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
          <FluxQueryBuilderProvider>
            <BucketProvider scope={scope} omitSampleData>
              <div className="scroll--container">
                <DapperScrollbars>
                  <div className="schema-browser" data-testid="schema-browser">
                    <Heading />
                    <BucketSelector />
                    <div className="container-side-bar">
                      <MeasurementSelector />
                      <FieldsTags />
                    </div>
                  </div>
                </DapperScrollbars>
              </div>
            </BucketProvider>
          </FluxQueryBuilderProvider>
        </TagsProvider>
      </FieldsProvider>
    </MeasurementsProvider>
  )
}

export default Schema
