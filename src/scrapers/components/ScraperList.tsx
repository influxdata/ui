// Libraries
import React, {FC, useMemo} from 'react'

// Components
import {ResourceList} from '@influxdata/clockface'
import ScraperRow from 'src/scrapers/components/ScraperRow'

// Types
import {Scraper} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {Sort} from '@influxdata/clockface'

// Selectors
import {getSortedResources} from 'src/shared/utils/sort'

interface Props {
  scrapers: Scraper[]
  emptyState: JSX.Element
  onDeleteScraper: (scraper) => void
  onUpdateScraper: (scraper: Scraper) => void
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
}

const ScraperList: FC<Props> = ({
  scrapers,
  emptyState,
  onDeleteScraper,
  onUpdateScraper,
  sortKey,
  sortDirection,
  sortType,
}) => {
  const sortedScrapers = useMemo(
    () => getSortedResources(scrapers, sortKey, sortDirection, sortType),
    [scrapers, sortKey, sortDirection, sortType]
  )

  const scrapersList = (): JSX.Element[] => {
    if (scrapers !== undefined) {
      return sortedScrapers.map(scraper => (
        <ScraperRow
          key={scraper.id}
          scraper={scraper}
          onDeleteScraper={onDeleteScraper}
          onUpdateScraper={onUpdateScraper}
        />
      ))
    }
    return
  }

  return (
    <ResourceList>
      <ResourceList.Body emptyState={emptyState}>
        {scrapersList()}
      </ResourceList.Body>
    </ResourceList>
  )
}

export default React.memo(ScraperList)
