// Libraries
import React, {FC, useContext, useEffect, useState, useMemo} from 'react'
import {v4 as UUID} from 'uuid'

// Components
import {AnnotationStreamOverlay} from 'src/annotations/components/overlay/AnnotationStreamOverlay'
import {Overlay, Button, ComponentColor} from '@influxdata/clockface'
import FlowBuilder from 'src/flows/components/Flow'
import _asResource from 'src/flows/context/resource.hook'

import {PIPE_DEFINITIONS} from 'src/flows'
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'
import {ResultsProvider} from 'src/flows/context/results'
import {FlowContext} from 'src/flows/context/flow.current'
import {hydrate} from 'src/flows/context/flow.list'
import {RemoteDataState, Flow} from 'src/types'

const DEFAULT_FLOW = JSON.stringify({
  name: 'Annotation',
  readOnly: false,
  range: DEFAULT_TIME_RANGE,
  refresh: AUTOREFRESH_DEFAULT,
  pipes: [
    {
      title: 'Select a Metric',
      visible: true,
      type: 'metricSelector',
      ...JSON.parse(JSON.stringify(PIPE_DEFINITIONS['metricSelector'].initial)),
    },
    {
      title: 'Visualize the Result',
      visible: true,
      type: 'visualization',
      ...JSON.parse(JSON.stringify(PIPE_DEFINITIONS['visualization'].initial)),
    },
  ],
})

const FlowProvider: FC = ({children}) => {
  const [flow, setFlow] = useState(hydrate(JSON.parse(DEFAULT_FLOW)))
  const fullFlow = useMemo(() => {
    return {
      ...flow,
      data: _asResource(flow.data, data => {
        setFlow({
          ...flow,
          data,
        })
      }),
      meta: _asResource(flow.meta, meta => {
        setFlow({
          ...flow,
          meta,
        })
      }),
    }
  }, [flow])

  useEffect(() => {
    setFlow(hydrate(JSON.parse(DEFAULT_FLOW)))
  }, [])

  const add = (initial, index?: number) => {
    const id = UUID()

    fullFlow.data.add(id, initial)
    fullFlow.meta.add(id, {
      title: PIPE_DEFINITIONS[initial.type].button,
      visible: true,
      loading: RemoteDataState.NotStarted,
    })

    if (typeof index !== 'undefined') {
      fullFlow.data.move(id, index + 1)
    }

    return id
  }

  const update = (_flow: Partial<Flow>) => {
    setFlow({
      ...flow,
      _flow,
    })
  }

  return (
    <FlowContext.Provider
      value={{
        id: 'annotation',
        name: 'Annotation',
        flow: fullFlow,
        add,
        update,
      }}
    >
      {children}
    </FlowContext.Provider>
  )
}

export const CreateAnnotationStreamOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)

  return (
    <AnnotationStreamOverlay title="Add Annotation Stream">
      <Overlay.Body>
        <FlowProvider>
          <ResultsProvider>
            <FlowBuilder />
          </ResultsProvider>
        </FlowProvider>
      </Overlay.Body>
      <Overlay.Footer>
        <Button text="Cancel" onClick={onClose} />
        <Button
          text="Add Annotation Stream"
          color={ComponentColor.Primary}
          onClick={() => {}}
        />
      </Overlay.Footer>
    </AnnotationStreamOverlay>
  )
}
