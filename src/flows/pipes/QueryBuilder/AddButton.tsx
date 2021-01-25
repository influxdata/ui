// Libraries
import React, {FC, useContext, useCallback} from 'react'
import {SquareButton, IconFont} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'

const INITIAL_TAG_STATE = {
          aggregateFunctionType: 'filter',
          keys: [],
          keysSearchTerm: '',
          keysStatus: RemoteDataState.NotStarted,
          values: [],
          valuesSearchTerm: '',
          valuesStatus: RemoteDataState.NotStarted,
        }

const AddButton: FC = () => {
    const {data, update} = useContext(PipeContext)
    const config = data.queries[data.activeQuery].builderConfig

    const onClick = useCallback(() => {
        // NOTE: immer would probably be easier to maintain
        update({
            queries: {
                ...data.queries,
                [data.activeQuery]: {
                    ...data.queries[data.activeQuery],
                    builderConfig: {
                        ...data.queries[data.activeQuery].builderConfig,
                        tags: [
                            ...data.queries[data.activeQuery].builderConfig.tags,
                            INITIAL_TAG_STATE
                        ]
                    }
                }
            }
        })
    }, [data, update])

    if (!config.tags.length) {
       return
    }

    const {keys, keysStatus} = config.tags[config.tags.length - 1]
    if (keys.length === 0 && keysStatus === RemoteDataState.Done) {
        return
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
