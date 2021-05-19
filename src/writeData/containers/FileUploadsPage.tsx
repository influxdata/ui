// Libraries
import React, {FC} from 'react'

// Components
import UploadDataDetailsView from 'src/writeData/components/fileUploads/UploadDataDetailsView'
import CsvUploaderProvider from 'src/buckets/components/context/csvUploader'
import LineProtocolProvider from 'src/buckets/components/context/lineProtocol'

const FileUploadsPage: FC = () => (
  <CsvUploaderProvider>
    <LineProtocolProvider>
      <UploadDataDetailsView />
    </LineProtocolProvider>
  </CsvUploaderProvider>
)

export default FileUploadsPage
