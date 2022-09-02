import React, {FC, ChangeEvent, useContext} from 'react'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'
import {
  Form,
  InputLabel,
  Input,
  InputType,
  ComponentStatus,
} from '@influxdata/clockface'

const Editor: FC = () => {
  const {resource, setResource} = useContext(PersistanceContext)

  const handleUpdateDescription = (event: ChangeEvent<HTMLInputElement>) => {
    setResource({
      ...resource,
      data: {
        ...(resource?.data ?? {}),
        description: event.target.value,
      },
    })
  }

  const handleUpdateName = (event: ChangeEvent<HTMLInputElement>) => {
    setResource({
      ...resource,
      data: {
        ...(resource?.data ?? {}),
        name: event.target.value,
      },
    })
  }

  return (
    <Form>
      <InputLabel>Save as</InputLabel>
      <Input
        className="save-script-name__input"
        name="name"
        required
        type={InputType.Text}
        value={resource?.data?.name}
        onChange={handleUpdateName}
        status={
          resource?.data?.id
            ? ComponentStatus.Disabled
            : ComponentStatus.Default
        }
      />
      <InputLabel>Description</InputLabel>
      <Input
        name="description"
        required
        type={InputType.Text}
        value={resource?.data?.description}
        onChange={handleUpdateDescription}
      />
    </Form>
  )
}

export default Editor
