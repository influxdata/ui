// Libraries
import React, {FC, useContext, useCallback} from 'react'
import {SquareButton, IconFont} from '@influxdata/clockface'
import {RemoteDataState} from 'src/types'

import {QueryBuilderContext} from 'src/flows/pipes/QueryBuilder/context'

const AddButton: FC = () => {
  const {cards, add} = useContext(QueryBuilderContext)

  const onClick = useCallback(() => {
    add()
  }, [add])

  if (!cards.length) {
    return null
  }

  const {keys} = cards[cards.length - 1]
  if (keys.results.length === 0 && keys.status === RemoteDataState.Done) {
    return null
  }

  return (
    <SquareButton
      className="query-builder--add-card-button"
      onClick={onClick}
      icon={IconFont.Plus}
    />
  )
}

export default AddButton
