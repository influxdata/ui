import React, {FC} from 'react'
import OverlayProvider from 'src/operator/context/overlay'
import AccountProvider from 'src/operator/context/account'
import AccountView from 'src/operator/account/AccountView'

const OperatorPage: FC = () => (
  <OverlayProvider>
    <AccountProvider>
      <AccountView />
    </AccountProvider>
  </OverlayProvider>
)

export default OperatorPage
