// Libraries
import React, {FC, useState, useContext, useEffect} from 'react'

// Components
import Embedded from './embedded'
import Editor from './editor'
import {PipeContext} from 'src/flows/context/pipe'
import {SidebarContext} from 'src/flows/context/sidebar'

// Types
import {PipeProp} from 'src/types/flows'

const Spotify: FC<PipeProp> = ({Context}) => {
  const {id, data} = useContext(PipeContext)
  const {register} = useContext(SidebarContext)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const toggleEdit = () => {
    setIsEditing(!isEditing)
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
            title: 'Edit Spotify URI',
            action: toggleEdit,
          },
        ],
      },
    ])
  }, [id, toggleEdit]) // eslint-disable-line react-hooks/exhaustive-deps

  const showEditing = isEditing || !data.uri

  return (
    <Context>
      <div className="flow-spotify">
        <Editor visible={showEditing} />
        <Embedded visible={!showEditing} />
      </div>
    </Context>
  )
}

export default Spotify
