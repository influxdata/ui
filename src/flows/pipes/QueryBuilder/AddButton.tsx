// Libraries
import React, {FC, useContext, useCallback} from 'react'
import {SquareButton, IconFont} from '@influxdata/clockface'
import {RemoteDataState} from 'src/types'

import {QueryBuilderContext} from 'src/flows/pipes/QueryBuilder/context'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

import {event} from 'src/cloud/utils/reporting'

const AddButton: FC = () => {
  const {cards, add} = useContext(QueryBuilderContext)

  const onClick = useCallback(() => {
    event('Query Builder Card Added')
    add()
  }, [add])

  if (!cards.length) {
    return null
  }

  if (
    isFlagEnabled('newQueryBuilder') &&
    !cards[0]?.values?.selected?.length &&
    cards.length < 2
  ) {
    return null
  }

  const {keys} = cards[cards.length - 1]
  if (keys.results.length === 0 && keys.loading === RemoteDataState.Done) {
    return null
  }

  return (
    <SquareButton
      className="query-builder--add-card-button"
      onClick={onClick}
      icon={IconFont.Plus_New}
    />
  )
}

export default AddButton
