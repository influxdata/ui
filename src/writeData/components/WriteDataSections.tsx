// Libraries
import React, {FC, useContext} from 'react'

// Contexts
import {WriteDataSearchContext} from 'src/writeData/containers/WriteDataPage'

// Constants
import {
  WRITE_DATA_SECTIONS,
  sectionContainsMatchingItems,
} from 'src/writeData/constants'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Components
import {EmptyState, ComponentSize} from '@influxdata/clockface'
import WriteDataSection from 'src/writeData/components/WriteDataSection'

const WriteDataSections: FC = () => {
  const {searchTerm} = useContext(WriteDataSearchContext)

  const filteredSections = WRITE_DATA_SECTIONS.filter(section => {
    const containsMatches = sectionContainsMatchingItems(section, searchTerm)
    const featureFlagEnabled = isFlagEnabled(section.featureFlag)

    return containsMatches && featureFlagEnabled
  })

  if (!filteredSections.length) {
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
      {filteredSections.map(section => (
        <WriteDataSection
          key={section.id}
          id={section.id}
          name={section.name}
          description={section.description}
          items={section.items}
        />
      ))}
    </>
  )
}

export default WriteDataSections
