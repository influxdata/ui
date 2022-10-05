import React, {FC, useState, useContext, useEffect} from 'react'
import {connect} from 'react-redux'
import {isEmpty} from 'lodash'

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
  RemoteDataState,
  JustifyContent,
  ComponentStatus,
} from '@influxdata/clockface'
import ResourceAccordion from 'src/authorizations/components/ResourceAccordion'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Types
import {AppState, ResourceType, Authorization} from 'src/types'
import {Bucket, Telegraf} from 'src/client'

// Seletors
import {getMe} from 'src/me/selectors'
import {getOrg} from 'src/organizations/selectors'
import {getAll} from 'src/resources/selectors'
import {getResourcesStatus} from 'src/resources/selectors/getResourcesStatus'

// Utils
import {
  formatApiPermissions,
  formatResources,
  generateDescription,
} from 'src/authorizations/utils/permissions'
import {event} from 'src/cloud/utils/reporting'
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

interface OwnProps {
  onClose: () => void
}
interface StateProps {
  allResources: string[]
  telegrafPermissions: any
  bucketPermissions: any
  remoteDataState: RemoteDataState
  orgID: string
  orgName: string
  meID: string
}
interface DispatchProps {
  getBuckets: () => void
  getTelegrafs: () => void
  createAuthorization: (auth) => void
  showOverlay: (arg1: string, arg2: any, any) => {}
}

type Props = StateProps & OwnProps & DispatchProps

const CustomApiTokenOverlay: FC<Props> = props => {
  const {onClose} = useContext(OverlayContext)
  const [description, setDescription] = useState('')
  const [permissions, setPermissions] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState(ComponentStatus.Disabled)

  useEffect(() => {
    props.getBuckets()
    props.getTelegrafs()
  }, [])

  useEffect(() => {
    if (!isEmpty(props.bucketPermissions.sublevelPermissions)) {
      const perms = {
        otherResources: {read: false, write: false},
      }
      props.allResources
        .filter(
          p => p !== ResourceType.Subscriptions && String(p) !== 'instance'
        )
        .forEach(resource => {
          if (resource === ResourceType.Telegrafs) {
            perms[resource] = props.telegrafPermissions
          } else if (resource === ResourceType.Buckets) {
            perms[resource] = props.bucketPermissions
          } else {
            perms[resource] = {read: false, write: false}
          }
        })
      setPermissions(perms)
    }
    // Each time remoteDataState changes, the useEffect hook will be called.
    // BUT, code inside the hook won't run until remoteDataState is 'Done'.
    // Only then will props.bucketPermissions.sublevelPermissions will have value.
    // Consequently, we update the permissions state.
  }, [props.remoteDataState])

  const handleDismiss = () => {
    props.onClose()
  }

  const handleChangeSearchTerm = (searchTerm: string): void => {
    setSearchTerm(searchTerm)
  }

  const handleInputChange = event => {
    setDescription(event.target.value)
  }

  const handleToggleAll = (resourceName, permission) => {
    setStatus(ComponentStatus.Default)
    const newPerm = {...permissions}

    let name = resourceName.replaceAll(/\s/g, '')
    name = name.charAt(0).toLowerCase() + name.slice(1)
    const newPermValue = newPerm[name][permission]
    if (newPerm[name].sublevelPermissions) {
      Object.keys(newPerm[name].sublevelPermissions).forEach(key => {
        newPerm[name].sublevelPermissions[key].permissions[permission] =
          !newPermValue
      })
    }
    if (name === 'otherResources') {
      Object.keys(newPerm).forEach(key => {
        if (
          key !== ResourceType.Buckets &&
          key !== ResourceType.Telegrafs &&
          key !== 'otherResources'
        ) {
          newPerm[key][permission] = !newPerm[key][permission]
        }
      })
    }

    newPerm[name][permission] = !newPermValue

    setPermissions(newPerm)
    isPermSelected(newPerm)
  }

  const handleIndividualToggle = (resourceName, id, permission) => {
    setStatus(ComponentStatus.Default)

    const permValue =
      permissions[resourceName].sublevelPermissions[id].permissions[permission]

    const newPerm = {...permissions}
    newPerm[resourceName].sublevelPermissions[id].permissions[permission] =
      !permValue

    setPermissions(newPerm)
    isSubPermSelected(newPerm)
  }

  const isPermSelected = perm => {
    const noReadPerm = Object.keys(perm).every(key => perm[key].read === false)
    const noWritePerm = Object.keys(perm).every(
      key => perm[key].write === false
    )

    if (noReadPerm && noWritePerm) {
      setStatus(ComponentStatus.Disabled)
    }
  }

  const isSubPermSelected = newPerm => {
    let noBucketReadPermSelected
    let noTelegrafReadPermSelected
    let noBucketWritePermSelected
    let noTelegrafWritePermSelected

    const bucketsTelegrafs = Object.keys(permissions).filter(
      resource =>
        resource === ResourceType.Buckets || resource === ResourceType.Telegrafs
    )

    bucketsTelegrafs.forEach(resource => {
      if (resource === ResourceType.Buckets) {
        noBucketReadPermSelected = Object.keys(
          newPerm[resource].sublevelPermissions
        ).every(
          key =>
            newPerm[resource].sublevelPermissions[key].permissions['read'] ===
            false
        )

        noBucketWritePermSelected = Object.keys(
          newPerm[resource].sublevelPermissions
        ).every(
          key =>
            newPerm[resource].sublevelPermissions[key].permissions['write'] ===
            false
        )
      } else {
        noTelegrafReadPermSelected = Object.keys(
          newPerm[resource].sublevelPermissions
        ).every(
          key =>
            newPerm[resource].sublevelPermissions[key].permissions['read'] ===
            false
        )

        noTelegrafWritePermSelected = Object.keys(
          newPerm[resource].sublevelPermissions
        ).every(
          key =>
            newPerm[resource].sublevelPermissions[key].permissions['write'] ===
            false
        )
      }
    })

    if (
      noBucketWritePermSelected &&
      noTelegrafWritePermSelected &&
      noBucketReadPermSelected &&
      noTelegrafReadPermSelected
    ) {
      setStatus(ComponentStatus.Disabled)
    }
  }

  const generateToken = async () => {
    const {meID, orgID, showOverlay, orgName, createAuthorization} = props
    const apiPermissions = formatApiPermissions(
      permissions,
      meID,
      orgID,
      orgName
    )

    const token: Authorization = {
      orgID: orgID,
      description: description
        ? description
        : generateDescription(apiPermissions),
      permissions: apiPermissions,
    }

    try {
      await createAuthorization(token)
      event('customApiToken.create.success', {description})
      showOverlay('access-token', null, () => dismissOverlay())
    } catch (e) {
      setStatus(ComponentStatus.Disabled)
      event('customApiToken.create.failure', {description})
    }
  }

  return (
    <Overlay.Container maxWidth={800}>
      <Overlay.Header
        className="overlay-header"
        title="Generate a Custom API Token"
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
              <SearchWidget
                searchTerm={searchTerm}
                placeholderText="Filter Access Permissions..."
                onSearch={handleChangeSearchTerm}
              />
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
                resources={formatResources(props.allResources)}
                permissions={permissions}
                onToggleAll={handleToggleAll}
                onIndividualToggle={handleIndividualToggle}
                searchTerm={searchTerm}
              />
            </FlexBox.Child>
          </FlexBox>
        </Form>
      </Overlay.Body>
      <Overlay.Footer className="overlay-footer">
        <Button
          color={ComponentColor.Tertiary}
          shape={ButtonShape.Default}
          onClick={handleDismiss}
          testID="cancel-token-overlay--buton"
          text="Cancel"
        />
        <Button
          color={ComponentColor.Success}
          shape={ButtonShape.Default}
          onClick={generateToken}
          status={status}
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
    orgName: getOrg(state).name,
    meID: getMe(state).id,
  }
}

const mdtp = {
  getBuckets,
  getTelegrafs,
  createAuthorization,
  showOverlay,
  dismissOverlay,
}

const connector = connect(mstp, mdtp)
export default connector(CustomApiTokenOverlay)
