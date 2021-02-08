// Libraries
import React, {FC, useState, useContext} from 'react'
import {Input} from '@influxdata/clockface'

// Components
import {SquareButton, IconFont} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'

// Types
import {PipeProp} from 'src/types/flows'

const Youtube: FC<PipeProp> = ({Context}) => {
  const {data, update} = useContext(PipeContext)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const toggleEdit = () => {
    setIsEditing(!isEditing)
  }
  const _update = evt => {
    update({uri: evt.target.value})
  }

  const controls = (
    <SquareButton
      icon={IconFont.CogThick}
      titleText="Edit Youtube ID"
      onClick={toggleEdit}
    />
  )

  const showEditing = isEditing || !data.uri

  return (
    <Context controls={controls}>
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
            height="448"
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
