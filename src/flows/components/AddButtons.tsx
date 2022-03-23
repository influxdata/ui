// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Button, ComponentColor, ComponentStatus} from '@influxdata/clockface'
import CellFamily from 'src/flows/components/CellFamily'

// Constants
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {PIPE_DEFINITIONS} from 'src/flows'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {event} from 'src/cloud/utils/reporting'

import {TypeRegistration} from 'src/types/flows'

// Styles
import 'src/flows/components/AddButtons.scss'

interface Props {
  index?: number
  onInsert?: () => void
}

const SUPPORTED_FAMILIES = [
  {
    name: 'Query Context',
    family: 'context',
  },
  {
    name: 'Data Source',
    family: 'inputs',
  },
  {
    name: 'Visualization',
    family: 'passThrough',
  },
  {
    name: 'Test',
    family: 'test',
  },
  {
    name: 'Action',
    family: 'output',
  },
]

const NEED_QUERY_PANELS = ['table', 'visualization', 'notification', 'schedule']

const AddButtons: FC<Props> = ({index, onInsert}) => {
  const {flow, add} = useContext(FlowContext)
  const {queryDependents} = useContext(FlowQueryContext)

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

  const pipeIds = flow.data.allIDs
  const firstQueryIndex = pipeIds.findIndex(
    id =>
      flow.data.byID[id].type === 'queryBuilder' ||
      flow.data.byID[id].type === 'rawFluxEditor'
  )

  const cellFamilies = SUPPORTED_FAMILIES.filter(fam =>
    pipeFamilies.hasOwnProperty(fam.family)
  ).map(fam => {
    const pipes = pipeFamilies[fam.family].map(def => {
      let status = ComponentStatus.Default
      if (index < firstQueryIndex && NEED_QUERY_PANELS.includes(def.type)) {
        status = ComponentStatus.Disabled
      }
      return (
        <Button
          className={`flows-add-cell-${def.type}`}
          key={def.type}
          text={def.button}
          disabledTitleText="This panel is only available after you have added a data source panel."
          testID={`add-flow-btn--${def.type}`}
          onClick={() => {
            let data = def.initial
            if (typeof data === 'function') {
              data = data()
            }

            onInsert && onInsert()

            let evtPos = 'between'

            if (index === -1) {
              evtPos = 'first'
            } else if (index === flow.data.allIDs.length - 1) {
              evtPos = 'last'
            }
            event('insert_notebook_cell', {
              notebooksCellType: def.type,
              position: evtPos,
            })
            queryDependents(
              add(
                {
                  ...data,
                  type: def.type,
                },
                index
              )
            )
          }}
          status={status}
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
