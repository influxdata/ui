// Libraries
import React, {FC, PureComponent} from 'react'
import {Switch, Route} from 'react-router-dom'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import NativeMethodsIndex from 'src/writeData/components/nativeMethods/NativeMethodsIndex'
import UploadDataDetailsView from 'src/writeData/components/nativeMethods/UploadDataDetailsView'
import UploadDataHelper from 'src/writeData/components/nativeMethods/UploadDataHelper'
import CsvUploaderProvider from 'src/buckets/components/context/csvUploader'
import LineProtocolProvider from 'src/buckets/components/context/lineProtocol'

// Constants
import {ORGS, ORG_ID, NATIVE_METHODS} from 'src/shared/constants/routes'
import WRITE_DATA_NATIVE_METHODS_SECTION from 'src/writeData/constants/contentNativeMethods'

const nativeMethodsPath = `/${ORGS}/${ORG_ID}/load-data/${NATIVE_METHODS}`

const NativeMethodsDetailsPage: FC = () => (
  <CsvUploaderProvider>
    <LineProtocolProvider>
      <UploadDataDetailsView section={WRITE_DATA_NATIVE_METHODS_SECTION}>
        <UploadDataHelper />
      </UploadDataDetailsView>
    </LineProtocolProvider>
  </CsvUploaderProvider>
)

@ErrorHandling
class NativeMethodsPage extends PureComponent {
  public render() {
    const {children} = this.props

    return (
      <>
        <Switch>
          <Route
            path={nativeMethodsPath}
            exact
            component={NativeMethodsIndex}
          />
          <Route
            path={`${nativeMethodsPath}/:contentID`}
            component={NativeMethodsDetailsPage}
          />
        </Switch>
        {children}
      </>
    )
  }
}

export default NativeMethodsPage
