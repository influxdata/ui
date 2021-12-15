// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
// import {useParams, useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux'

// Utils
import {
   getAccounts,
} from 'src/client/unityRoutes'
// import {notify} from 'src/shared/actions/notifications'
// import {
//     getAccountError,
//     deleteAccountError,
// } from 'src/shared/copy/notifications'



// todo:  talk to randy, about making this a real type, like OperatorAccount in unityRoutes.ts
// for now: defining it here (duck typing)
export interface UserAccount {
    id: number,
    isActive: boolean
    isDefault: boolean
    name: string
}
export type Props = {
    children: JSX.Element
}

export interface UserAccountContextType {
    userAccounts: UserAccount[]
    handleGetAccounts: () => void
    setDefaultAccount: () => void
}

// hmm...you know from the MeContext which is the account that is currently logged into.....

export const DEFAULT_CONTEXT:  UserAccountContextType = {
       userAccounts: [],
        handleGetAccounts: () => {},
    setDefaultAccount: () => {},
}

export const UserAccountContext = React.createContext<UserAccountContextType>(DEFAULT_CONTEXT)
const dispatch = useDispatch()

//todo:  put in dependency array:  whenever the default account changes, should redo the call.

export const UserAccountProvider: FC<Props>= React.memo(({children}) => {
    const [userAccounts, setUserAccounts] = useState<UserAccount[]>(null)
    const [defaultAccountId, setDefaultAccountId] = useState<number>(null)

    const handleGetAccounts = useCallback(async () => {
        try {
            const resp = await getAccounts(null)
            if (resp.status !== 200 ) {
                // set user account status to error;...TODO
                throw new Error(resp.data.message)
            }
 console.log('got the data response!', resp.data);
            const arghh = resp.data;
            if (Array.isArray(arghh)) {
                setUserAccounts(resp.data)
                const defaultId = resp.data.filter(line => line.isDefault)?.id
                console.log('got the default id....', defaultId)
                setDefaultAccountId(defaultId)
            } else {
                console.log('arghh!  did not get an array.... :(');
            }
        } catch (error) {
            console.log('caught error...', error);
        }
    }, [dispatch])

useEffect(() => {
    handleGetAccounts()
}, [handleGetAccounts, defaultAccountId])


    return (
        <UserAccountContext.Provider
            value={{
            userAccounts,
            defaultAccountId,
            handleGetAccounts,
            }}
            >
            {children}
        </UserAccountContext.Provider>
    )

})

export default UserAccountProvider