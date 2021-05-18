// Libraries
import React, {FC, useEffect, useContext} from 'react'

// Types
import {PipeProp} from 'src/types/flows'

// Contexts
import BucketProvider from 'src/flows/context/buckets'
import {PipeContext} from 'src/flows/context/pipe'
import {Context as SidebarContext} from 'src/flows/context/sidebar'
import {PopupContext} from 'src/flows/context/popup'

// Components
import BucketSelector from 'src/flows/shared/BucketSelector'
import ExportTaskOverlay from 'src/flows/pipes/ToBucket/ExportTaskOverlay'

// Utils
import {event} from 'src/cloud/utils/reporting'

const ToBucket: FC<PipeProp> = ({Context}) => {
  const {id, data, range} = useContext(PipeContext)
  const {register} = useContext(SidebarContext)
  const {launch} = useContext(PopupContext)

  useEffect(() => {
    if (!id) {
      return
    }

    register(id, [
      {
        title: 'To Bucket',
        actions: [
          {
            title: 'Export as Task',
            action: () => {
              event('Export Task Clicked')

              launch(<ExportTaskOverlay />, {
                properties: data.properties,
                range: range,
                panel: id,
              })
            },
          },
        ],
      },
    ])
  }, [id, data.properties, range])

  return (
    <BucketProvider>
      <Context>
        <div className="data-source--controls">
          <BucketSelector />
        </div>
      </Context>
    </BucketProvider>
  )
}

export default ToBucket
