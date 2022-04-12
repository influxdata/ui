// Libraries
import React, {FC, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Types
import {AppState, Organization, ResourceType} from 'src/types'

// Selectors
import {getAll} from 'src/resources/selectors'
import {getOrg} from 'src/organizations/selectors'

const RouteToOrg: FC = () => {
  const org = useSelector(getOrg)
  const orgs = useSelector((state: AppState) =>
    getAll<Organization>(state, ResourceType.Orgs)
  )

  const history = useHistory()
  useEffect(() => {
    if (!orgs || !orgs.length) {
      history.push(`/no-orgs`)
      return
    }

    // org from local storage
    if (org && org.id) {
      history.push(`/orgs/${org.id}`)
      return
    }

    // else default to first org
    history.push(`/orgs/${orgs[0].id}`)
  }, [orgs, org])

  return <></>
}

export default RouteToOrg
