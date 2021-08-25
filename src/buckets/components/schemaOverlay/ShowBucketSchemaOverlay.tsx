// Libraries
import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'

// Components
import {SchemaDisplay} from './SchemaDisplay'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Selectors
import {getOverlayParams} from 'src/overlays/selectors'

export const ShowBucketSchemaOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)
  let {schema, bucketName} = useSelector(getOverlayParams)

  //if (!name) { name = 'foobar-test-name'}

  return (
    <SchemaDisplay onClose={onClose} schema={schema} bucketName={bucketName} />
  )
}
