// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Button, ComponentColor} from '@influxdata/clockface'
import CellFamily from 'src/flows/components/CellFamily'

// Constants
import {FlowContext} from 'src/flows/context/flow.current'
import {ResultsContext} from 'src/flows/context/results'
import {PIPE_DEFINITIONS} from 'src/flows'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

import {TypeRegistration} from 'src/types/flows'

// Styles
import 'src/flows/components/AddButtons.scss'

interface Props {
  index?: number
  onInsert?: () => void
  eventName: string
}

const SUPPORTED_FAMILIES = [
  {
    name: 'Input',
    family: 'inputs',
  },
  {
    name: 'Transform',
    family: 'transform',
  },
  {
    name: 'Pass Throughs',
    family: 'passThrough',
  },
  {
    name: 'Test',
    family: 'test',
  },
  {
    name: 'Output',
    family: 'output',
  },
  {
    name: 'Side Effects',
    family: 'sideEffects',
  },
]

const AddButtons: FC<Props> = ({index, onInsert, eventName}) => {
  const {add} = useContext(FlowContext)
  const results = useContext(ResultsContext)

  const pipeFamilies = Object.entries(
    Object.values(PIPE_DEFINITIONS)
      .filter(
        def =>
          !def.disabled && (!def.featureFlag || isFlagEnabled(def.featureFlag))
      )
      .reduce((acc, def) => {
        if (!acc.hasOwnProperty(def.family)) {
          acc[def.family] = []
        }

        acc[def.family].push(def)

        return acc
      }, {})
  ).reduce((acc, [key, val]) => {
    acc[key] = (val as TypeRegistration[]).sort((a, b) => {
      const aPriority = a.priority || 0
      const bPriority = b.priority || 0

      if (aPriority === bPriority) {
        return a.button.localeCompare(b.button)
      }

      return bPriority - aPriority
    })
    return acc
  }, {})

  const cellFamilies = SUPPORTED_FAMILIES.filter(fam =>
    pipeFamilies.hasOwnProperty(fam.family)
  ).map(fam => {
    const pipes = pipeFamilies[fam.family].map(def => {
      return (
        <Button
          className={`flows-add-cell-${def.type}`}
          key={def.type}
          text={def.button}
          testID={`add-flow-btn--${def.type}`}
          onClick={() => {
            let data = def.initial
            if (typeof data === 'function') {
              data = data()
            }

            onInsert && onInsert()

            event(eventName, {
              type: def.type,
            })

            const id = add(
              {
                ...data,
                type: def.type,
              },
              index
            )

            results.add(id)
          }}
          color={ComponentColor.Secondary}
        />
      )
    })
    return (
      <CellFamily key={fam.name} title={fam.name}>
        {pipes}
      </CellFamily>
    )
  })

  return <div className="add-cell-menu">{cellFamilies}</div>
}

export default AddButtons
