// Libraries
import React, {FC, ChangeEvent, useContext} from 'react'
import {useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {TextArea} from '@influxdata/clockface'
import DragAndDrop from 'src/buckets/components/lineProtocol/configure/DragAndDrop'
import {LineProtocolContext} from 'src/buckets/components/context/lineProtocol'

// Utils
import {getByID} from 'src/resources/selectors'

// Types
import {AppState, Bucket, ResourceType} from 'src/types'

type Props = {
  bucket?: string
}

const TabBody: FC<Props> = ({bucket}) => {
  const {body, handleSetBody, tab, writeLineProtocol} = useContext(
    LineProtocolContext
  )
  const {bucketID} = useParams<{bucketID?: string}>()

  const selectedBucket =
    useSelector((state: AppState) =>
      getByID<Bucket>(state, ResourceType.Buckets, bucketID)
    )?.name ?? ''

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    handleSetBody(e.target.value)
  }

  const onSetBody = (b: string) => {
    handleSetBody(b)
  }

  const handleSubmit = () => {
    writeLineProtocol(bucket ?? selectedBucket)
  }

  switch (tab) {
    case 'Upload File':
      return (
        <DragAndDrop
          className="line-protocol--content"
          onSubmit={handleSubmit}
          onSetBody={onSetBody}
        />
      )
    case 'Enter Manually':
      return (
        <TextArea
          value={body}
          placeholder="Write text here"
          onChange={handleTextChange}
          testID="line-protocol--text-area"
          className="line-protocol--content"
        />
      )
  }
}

export default TabBody
