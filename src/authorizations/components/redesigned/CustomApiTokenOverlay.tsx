import React, {FC, useState, useContext, useEffect} from 'react'
import 'src/authorizations/components/redesigned/customApiTokenOverlay.scss'

// Actions 
import {getBuckets} from 'src/buckets/actions/thunks'
import {getTelegrafs} from 'src/telegrafs/actions/thunks'

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
import {AppState, ResourceType} from 'src/types'
import { getResourcesStatus } from 'src/resources/selectors/getResourcesStatus'
import { getAll } from 'src/resources/selectors'
import { Bucket, Telegraf } from 'src/client'

interface OwnProps {
  onClose: () => void
}

interface StateProps {
  allResources: string[]
  telegrafPermissions: any 
  bucketPermissions: any
  remoteDataState: RemoteDataState
}

interface DispatchProps {
  getBuckets: () => void 
  getTelegrafs: () => void
}

type Props = OwnProps & StateProps & DispatchProps

const CustomApiTokenOverlay: FC<Props> = props => {

  const {onClose} = useContext(OverlayContext)

  const [description, setDescription] = useState('')
  const [permissions, setPermissions] = useState({})

  useEffect(() => {
    props.getBuckets()
    props.getTelegrafs()
    console.log("telegraf and bucket perm: ", props.telegrafPermissions, props.bucketPermissions)
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
      console.log("perms: ", perms)
  
  },[])


  const handleDismiss = () => {
    props.onClose()
  }
  console.log("state permissions: ", permissions)

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
              <ResourceAccordion resources={formatAllResources()} />
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
          onClick={() => {}}
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
    ResourceType.Telegrafs
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
    remoteDataState
  }
}

const mdtp = {
  getBuckets, 
  getTelegrafs,
}

export default connect(mstp, mdtp)(CustomApiTokenOverlay)
