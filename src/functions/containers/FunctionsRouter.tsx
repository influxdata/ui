// Libraries
import React, {FC} from 'react'
import {Route, Switch} from 'react-router-dom'
import {
  FunctionEditWrapper,
  FunctionNewWrapper,
  FunctionRunListPage,
  FunctionListPage,
} from 'src/shared/containers'

// context stuff
import FunctionListProvider from 'src/functions/context/function.list'

const FunctionsRouter: FC = () => {
  const orgPath = '/orgs/:orgID'

  return (
    <FunctionListProvider>
      <Switch>
        <Route
          path={`${orgPath}/functions/:id/runs`}
          component={FunctionRunListPage}
        />
        <Route
          path={`${orgPath}/functions/:id/edit`}
          component={FunctionEditWrapper}
        />
        <Route
          path={`${orgPath}/functions/new`}
          component={FunctionNewWrapper}
        />
        <Route path={`${orgPath}/functions`} component={FunctionListPage} />
      </Switch>
    </FunctionListProvider>
  )
}

export default FunctionsRouter
