// Libraries
import React, {FC} from 'react'

// Components
import UploadDataDetailsView from 'src/writeData/components/fileUploads/UploadDataDetailsView'
import {LineProtocolProvider} from 'src/buckets/components/context/lineProtocol'

const FileUploadsPage: FC = () => (
  <LineProtocolProvider>
    <UploadDataDetailsView />
  </LineProtocolProvider>
)

export default FileUploadsPage
