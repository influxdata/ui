import React, {FC} from 'react'
import {Route, Switch} from 'react-router-dom'
import OperatorProvider from 'src/operator/context/operator'
import Operator from 'src/operator/Operator'
import {AccountPage} from 'src/shared/containers'

const OperatorPage: FC = () => (
  <OperatorProvider>
    <Switch>
      <Route
        exact
        path="/operator/accounts/:accountID"
        component={AccountPage}
      />
      <Route path="/operator" component={Operator} />
    </Switch>
  </OperatorProvider>
)

export default OperatorPage
