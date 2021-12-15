// Libraries
import React, {FC} from 'react'
import {Switch, Route} from 'react-router-dom'
import {Page, } from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
// import {event, useLoadTimeReporting} from 'src/cloud/utils/reporting'
// import {FeatureFlag} from 'src/shared/utils/featureFlag'
//
//
// import {AppSettingContext} from 'src/shared/contexts/app'
// import {UserAccountContext} from "./context/userAccount";

const AccountAboutPage: FC =() => {
    return <h1> hello world on the account about page</h1>
}


const AccountPage: FC = () => {
    //const {userAccounts} = useContext(UserAccountContext)

    //todo:  look at userlistcontainer for a tabbed example! 
    //console.log('got userAccounts???', userAccounts)
    console.log("arghh")
    return (
        <Page titleTag={pageTitleSuffixer(['Account About page....'])}>
            <Switch>
                <Route
                    path="/accounts/about"
                    component={AccountAboutPage}
                    />
            </Switch>
            <AccountAboutPage/>
        </Page>
    )
}

export default AccountPage