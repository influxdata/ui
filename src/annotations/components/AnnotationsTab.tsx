// Libraries
import React, {FC, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
  Grid,
  Columns,
  EmptyState,
  ComponentSize,
  Sort,
  Button,
  ComponentColor,
  IconFont,
} from '@influxdata/clockface'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import TabbedPageHeader from 'src/shared/components/tabbed_page/TabbedPageHeader'
import Filter from 'src/shared/components/FilterList'
import GetResources from 'src/resources/components/GetResources'

import {AnnotationsList} from 'src/annotations/components/AnnotationsList'
import {AnnotationsExplainer} from 'src/annotations/components/AnnotationsExplainer'

// Selectors
import {getOrg} from 'src/organizations/selectors'

// Types
import {ResourceType} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'

// Mocks
import {
  AnnotationStream,
  MOCK_ANNOTATION_STREAMS,
} from 'src/annotations/constants/mocks'

const FilterList = Filter<AnnotationStream>()

interface AnnotationsTabEmptyStateProps {
  searchTerm?: string
}

const AnnotationsTabEmptyState: FC<AnnotationsTabEmptyStateProps> = ({
  searchTerm,
}) => {
  if (!searchTerm) {
    return (
      <EmptyState size={ComponentSize.Large}>
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
  const org = useSelector(getOrg)
  const history = useHistory()

  const [searchTerm, setSearchTerm] = useState<string>('')

  // TODO: make these stateful
  const sortKey = 'name'
  const sortDirection = Sort.Ascending
  const sortType = SortTypes.String

  const handleAddAnnotationStream = (): void => {
    history.push(`/orgs/${org.id}/settings/annotations/new`)
  }

  const leftHeaderItems = (
    <SearchWidget
      placeholderText="Filter annotation streams..."
      searchTerm={searchTerm}
      onSearch={setSearchTerm}
    />
  )

  const rightHeaderItems = (
    <Button
      text="Add Annotation Stream"
      icon={IconFont.Annotate}
      color={ComponentColor.Primary}
      onClick={handleAddAnnotationStream}
    />
  )

  return (
    <>
      <TabbedPageHeader
        childrenLeft={leftHeaderItems}
        childrenRight={rightHeaderItems}
      />
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
                list={MOCK_ANNOTATION_STREAMS}
              >
                {annotationStreams => (
                  <AnnotationsList
                    annotationStreams={annotationStreams}
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
