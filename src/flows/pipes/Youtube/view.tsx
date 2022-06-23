// Libraries
import React, {FC, useState, useContext, useCallback, useEffect} from 'react'
import {Input} from '@influxdata/clockface'

// Components
import {PipeContext} from 'src/flows/context/pipe'
import {SidebarContext} from 'src/flows/context/sidebar'

// Types
import {PipeProp} from 'src/types/flows'

const Youtube: FC<PipeProp> = ({Context}) => {
  const {id, data, update} = useContext(PipeContext)
  const {register} = useContext(SidebarContext)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const toggleEdit = useCallback(() => {
    setIsEditing(!isEditing)
  }, [setIsEditing, isEditing])

  const _update = evt => {
    update({uri: evt.target.value})
  }

  useEffect(() => {
    if (!id) {
      return
    }

    register(id, [
      {
        title: 'Controls',
        actions: [
          {
            title: 'Edit Youtube ID',
            action: toggleEdit,
          },
        ],
      },
    ])
  }, [id, toggleEdit]) // eslint-disable-line react-hooks/exhaustive-deps

  const showEditing = isEditing || !data.uri

  return (
    <Context resizes>
      <div className="flow-youtube">
        {showEditing && (
          <div className="flow-youtube--editor">
            <label>Youtube Video ID</label>
            <Input value={data.uri} onChange={_update} />
          </div>
        )}
        {!showEditing && (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${data.uri}?autoplay=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </Context>
  )
}

export default Youtube
