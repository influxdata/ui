// Libraries
import React, {FC, useMemo} from 'react'

// Components
import {ResourceList} from '@influxdata/clockface'
import SecretCard from 'src/secrets/components/SecretCard'

// Types
import {Secret} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {Sort} from '@influxdata/clockface'

// Selectors
import {getSortedResources} from 'src/shared/utils/sort'

interface Props {
  secrets: Secret[]
  emptyState: JSX.Element
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
}

const SecretsList: FC<Props> = props => {
  const {emptyState, secrets, sortKey, sortDirection, sortType} = props

  const sortedSecrets = useMemo(
    () => getSortedResources(secrets, sortKey, sortDirection, sortType),
    [secrets, sortKey, sortDirection, sortType]
  )

  return (
    <>
      <ResourceList>
        <ResourceList.Body emptyState={emptyState}>
          {sortedSecrets.map((secret, index) => (
            <SecretCard key={secret?.id || `secret-${index}`} secret={secret} />
          ))}
        </ResourceList.Body>
      </ResourceList>
    </>
  )
}

export default SecretsList
