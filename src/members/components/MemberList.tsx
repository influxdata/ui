// Libraries
import React, {FC, useMemo} from 'react'

// Components
import {ResourceList} from '@influxdata/clockface'
import MemberCard from 'src/members/components/MemberCard'

// Types
import {Member} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {Sort} from '@influxdata/clockface'

// Selectors
import {getSortedResources} from 'src/shared/utils/sort'

type SortKey = keyof Member

interface Props {
  members: Member[]
  emptyState: JSX.Element
  onDelete: (member: Member) => void
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
  onClickColumn: (nextSort: Sort, sortKey: SortKey) => void
}

const MemberList: FC<Props> = ({
  members,
  emptyState,
  onDelete,
  sortKey,
  sortDirection,
  sortType,
  onClickColumn,
}) => {
  const headerKeys: SortKey[] = ['name', 'role']

  const sortedMembers = useMemo(
    () => getSortedResources(members, sortKey, sortDirection, sortType),
    [members, sortKey, sortDirection, sortType]
  )

  const rows = (): JSX.Element[] => {
    return sortedMembers.map(member => (
      <MemberCard key={member.id} member={member} onDelete={onDelete} />
    ))
  }

  return (
    <ResourceList>
      <ResourceList.Header>
        <ResourceList.Sorter
          name="Username"
          sortKey={headerKeys[0]}
          sort={sortKey === headerKeys[0] ? sortDirection : Sort.None}
          onClick={onClickColumn}
        />
        <ResourceList.Sorter
          name="Role"
          sortKey={headerKeys[1]}
          sort={sortKey === headerKeys[1] ? sortDirection : Sort.None}
          onClick={onClickColumn}
        />
      </ResourceList.Header>
      <ResourceList.Body emptyState={emptyState} data-testid="members-list">
        {rows()}
      </ResourceList.Body>
    </ResourceList>
  )
}

export default React.memo(MemberList)
