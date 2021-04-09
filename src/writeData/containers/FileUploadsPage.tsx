// Libraries
import React, {FC, PureComponent} from 'react'
import {Switch, Route} from 'react-router-dom'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import FileUploadsIndex from 'src/writeData/components/fileUploads/FileUploadsIndex'
import UploadDataDetailsView from 'src/writeData/components/fileUploads/UploadDataDetailsView'
import UploadDataHelper from 'src/writeData/components/fileUploads/UploadDataHelper'
import CsvUploaderProvider from 'src/buckets/components/context/csvUploader'
import LineProtocolProvider from 'src/buckets/components/context/lineProtocol'

// Constants
import {ORGS, ORG_ID, FILE_UPLOAD} from 'src/shared/constants/routes'
import WRITE_DATA_FILE_UPLOAD_SECTION from 'src/writeData/constants/contentFileUploads'

const fileUploadsPath = `/${ORGS}/${ORG_ID}/load-data/${FILE_UPLOAD}`

const FileUploadsDetailsPage: FC = () => (
  <CsvUploaderProvider>
    <LineProtocolProvider>
      <UploadDataDetailsView section={WRITE_DATA_FILE_UPLOAD_SECTION}>
        <UploadDataHelper />
      </UploadDataDetailsView>
    </LineProtocolProvider>
  </CsvUploaderProvider>
)

@ErrorHandling
class FileUploadsPage extends PureComponent {
  public render() {
    const {children} = this.props

    return (
      <>
        <Switch>
          <Route path={fileUploadsPath} exact component={FileUploadsIndex} />
          <Route
            path={`${fileUploadsPath}/:contentID`}
            component={FileUploadsDetailsPage}
          />
        </Switch>
        {children}
      </>
    )
  }
}

export default FileUploadsPage
