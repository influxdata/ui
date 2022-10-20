// Libraries
import React, {FC, useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Components
import {
  Columns,
  ComponentSize,
  EmptyState,
  Grid,
  Sort,
} from '@influxdata/clockface'
import {SearchWidget} from 'src/shared/components/search_widget/SearchWidget'
import TabbedPageHeader from 'src/shared/components/tabbed_page/TabbedPageHeader'
import {FilterListContainer} from 'src/shared/components/FilterList'
import GetResources from 'src/resources/components/GetResources'

import {AnnotationsList} from 'src/annotations/components/AnnotationsList'
import {AnnotationsExplainer} from 'src/annotations/components/AnnotationsExplainer'

// Selectors
import {getAnnotationStreams} from 'src/annotations/selectors'

// Types
import {ResourceType, AnnotationStream} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'

// Thunks
import {fetchAndSetAnnotationStreams} from 'src/annotations/actions/thunks'

const FilterList = FilterListContainer<AnnotationStream>()

interface AnnotationsTabEmptyStateProps {
  searchTerm?: string
}

const AnnotationsTabEmptyState: FC<AnnotationsTabEmptyStateProps> = ({
  searchTerm,
}) => {
  if (!searchTerm) {
    return (
      <EmptyState size={ComponentSize.Large} testID="annotations-empty-state">
        <EmptyState.Text>
          Looks like there aren't any <b>Annotation Streams</b>, why not create
          one?
        </EmptyState.Text>
      </EmptyState>
    )
  }

  return (
    <EmptyState size={ComponentSize.Large}>
      <EmptyState.Text>No Annotation Streams match your query</EmptyState.Text>
    </EmptyState>
  )
}

export const AnnotationsTab: FC = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchAndSetAnnotationStreams)
  }, [dispatch])

  const annotationStreams = useSelector(getAnnotationStreams)
  const [searchTerm, setSearchTerm] = useState<string>('')

  // TODO: make these stateful
  const sortKey = 'name'
  const sortDirection = Sort.Ascending
  const sortType = SortTypes.String

  const leftHeaderItems = (
    <SearchWidget
      placeholderText="Filter annotation streams..."
      searchTerm={searchTerm}
      onSearch={setSearchTerm}
    />
  )

  return (
    <>
      <TabbedPageHeader childrenLeft={leftHeaderItems} />
      <Grid>
        <Grid.Row>
          <Grid.Column
            widthXS={Columns.Twelve}
            widthSM={Columns.Eight}
            widthMD={Columns.Ten}
          >
            <GetResources resources={[ResourceType.Labels]}>
              <FilterList
                searchTerm={searchTerm}
                searchKeys={['name']}
                list={annotationStreams}
              >
                {streams => (
                  <AnnotationsList
                    annotationStreams={streams}
                    emptyState={
                      <AnnotationsTabEmptyState searchTerm={searchTerm} />
                    }
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    sortType={sortType}
                  />
                )}
              </FilterList>
            </GetResources>
          </Grid.Column>
          <Grid.Column
            widthXS={Columns.Twelve}
            widthSM={Columns.Four}
            widthMD={Columns.Two}
          >
            <AnnotationsExplainer />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  )
}
