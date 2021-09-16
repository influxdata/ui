import React, {FC, useState, useContext, useEffect} from 'react'
import 'src/authorizations/components/redesigned/customApiTokenOverlay.scss'

// Actions
import {getBuckets} from 'src/buckets/actions/thunks'
import {getTelegrafs} from 'src/telegrafs/actions/thunks'
import {createAuthorization} from 'src/authorizations/actions/thunks'

// Components
import {
  Overlay,
  Form,
  Input,
  FlexBox,
  AlignItems,
  FlexDirection,
  ComponentSize,
  Button,
  ComponentColor,
  ButtonShape,
  InputLabel,
  JustifyContent,
  RemoteDataState,
} from '@influxdata/clockface'

import ResourceAccordion from './ResourceAccordion'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'
import {connect} from 'react-redux'
import {AppState, ResourceType, Authorization} from 'src/types'
import {getResourcesStatus} from 'src/resources/selectors/getResourcesStatus'
import {getAll} from 'src/resources/selectors'
import {Bucket, Telegraf} from 'src/client'

import {formatApiPermissions} from 'src/authorizations/utils/permissions'
import {getOrg} from 'src/organizations/selectors'

interface OwnProps {
  onClose: () => void
}

interface StateProps {
  allResources: string[]
  telegrafPermissions: any
  bucketPermissions: any
  remoteDataState: RemoteDataState
  orgID: string
}

interface DispatchProps {
  getBuckets: () => void
  getTelegrafs: () => void
  onCreateAuthorization: (auth) => void
}


type Props = OwnProps & StateProps & DispatchProps

const CustomApiTokenOverlay: FC<Props> = props => {
  const {onClose} = useContext(OverlayContext)

  const [description, setDescription] = useState('')
  const [permissions, setPermissions] = useState({})

  useEffect(() => {
    props.getBuckets()
    props.getTelegrafs()
  }, [])

  useEffect(() => {
    const perms = {}
    props.allResources.map(resource => {
      if (resource === 'telegrafs') {
        perms[resource] = props.telegrafPermissions
      } else if (resource === 'buckets') {
        perms[resource] = props.bucketPermissions
      } else {
        perms[resource] = {read: false, write: false}
      }
    })
    setPermissions(perms)
  }, [props.telegrafPermissions, props.bucketPermissions])
  
  const handleDismiss = () => {
    props.onClose()
  }
  
  const handleInputChange = event => {
    setDescription(event.target.value)
  }

  const formatAllResources = () => {
    let resources = props.allResources
    resources = resources.filter(
      item => item !== 'buckets' && item !== 'telegrafs'
    )
    resources.sort()
    resources.unshift('telegrafs')
    resources.unshift('buckets')
    return resources
  }
  const handleToggleAll = (resourceName, permission) => {
    const newPerm = {...permissions}

    const name = resourceName.charAt(0).toLowerCase() + resourceName.slice(1)
    const newPermValue = newPerm[name][permission]

    if (newPerm[name].sublevelPermissions) {
      Object.keys(newPerm[name].sublevelPermissions).map(key => {
        newPerm[name].sublevelPermissions[key].permissions[
          permission
        ] = !newPermValue
      })
    }
    newPerm[name][permission] = !newPermValue

    setPermissions(newPerm)
  }

  const handleIndividualToggle = (resourceName, id, permission) => {
    const permValue =
      permissions[resourceName].sublevelPermissions[id].permissions[permission]

    const newPerm = {...permissions}
    newPerm[resourceName].sublevelPermissions[id].permissions[
      permission
    ] = !permValue

    const headerPermValue = !Object.keys(
      newPerm[resourceName].sublevelPermissions
    ).some(
      key =>
        newPerm[resourceName].sublevelPermissions[key].permissions[
          permission
        ] === false
    )

    newPerm[resourceName][permission] = headerPermValue

    setPermissions(newPerm)
  }

  const generateToken = () => {
    
    
    const token: Authorization = {
      orgID: props.orgID,
      description: description,
      permissions: formatApiPermissions(permissions, props.orgID),
    }

    props.onCreateAuthorization(token)


  }

  return (
    <Overlay.Container maxWidth={800}>
      <Overlay.Header
        title="Generate a Personal Api Token"
        onDismiss={onClose}
      />
      <Overlay.Body>
        <Form>
          <FlexBox
            alignItems={AlignItems.Center}
            direction={FlexDirection.Column}
            margin={ComponentSize.Large}
          >
            <Form.Element label="Description">
              <Input
                placeholder="Describe this new token"
                value={description}
                onChange={handleInputChange}
                testID="custom-api-token-input"
              />
            </Form.Element>
            <FlexBox.Child className="main-flexbox-child">
              <FlexBox
                margin={ComponentSize.Large}
                justifyContent={JustifyContent.SpaceBetween}
                direction={FlexDirection.Row}
                stretchToFitWidth={true}
                alignItems={AlignItems.Center}
                className="flex-box-label"
              >
                <FlexBox.Child basis={40} grow={8}>
                  <InputLabel size={ComponentSize.ExtraSmall}>
                    Resources
                  </InputLabel>
                </FlexBox.Child>
                <FlexBox.Child grow={1} className="flexbox-child-label-read">
                  <InputLabel
                    className="input-label-read"
                    size={ComponentSize.ExtraSmall}
                  >
                    Read
                  </InputLabel>
                </FlexBox.Child>
                <FlexBox.Child grow={1} className="flexbox-child-label-write">
                  <InputLabel
                    className="input-label-write"
                    size={ComponentSize.ExtraSmall}
                  >
                    Write
                  </InputLabel>
                </FlexBox.Child>
              </FlexBox>
              <ResourceAccordion
                resources={formatAllResources()}
                permissions={permissions}
                onToggleAll={handleToggleAll}
                onIndividualToggle={handleIndividualToggle}
              />
            </FlexBox.Child>
          </FlexBox>
        </Form>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          color={ComponentColor.Primary}
          shape={ButtonShape.Default}
          onClick={handleDismiss}
          testID="cancel-token-overlay--buton"
          text="Cancel"
        />
        <Button
          color={ComponentColor.Success}
          shape={ButtonShape.Default}
          onClick={generateToken}
          testID="generate-token-overlay--buton"
          text="Generate"
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}


const mstp = (state: AppState) => {
  const remoteDataState = getResourcesStatus(state, [
    ResourceType.Buckets,
    ResourceType.Telegrafs,
  ])

  const telegrafs = getAll<Telegraf>(state, ResourceType.Telegrafs)
  const telegrafPermissions = {
    read: false,
    write: false,
    sublevelPermissions: {},
  }
  telegrafs.forEach(telegraf => {
    telegrafPermissions.sublevelPermissions[telegraf.id] = {
      id: telegraf.id,
      orgID: telegraf.orgID,
      name: telegraf.name,
      permissions: {read: false, write: false},
    }
  })

  const buckets = getAll<Bucket>(state, ResourceType.Buckets)
  const bucketPermissions = {
    read: false,
    write: false,
    sublevelPermissions: {},
  }
  buckets.forEach(bucket => {
    bucketPermissions.sublevelPermissions[bucket.id] = {
      id: bucket.id,
      orgID: bucket.orgID,
      name: bucket.name,
      permissions: {read: false, write: false},
    }
  })

  return {
    allResources: state.resources.tokens.allResources,
    telegrafPermissions,
    bucketPermissions,
    remoteDataState,
    orgID: getOrg(state).id,
  }
}

const mdtp = {
  getBuckets,
  getTelegrafs,
  onCreateAuthorization: createAuthorization,
}

export default connect(mstp, mdtp)(CustomApiTokenOverlay)
