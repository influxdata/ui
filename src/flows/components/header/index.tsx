// Libraries
import React, {FC, useContext, useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {AppSettingProvider} from 'src/shared/contexts/app'

// Components
import {
  Page,
  SquareButton,
  IconFont,
  ComponentColor,
  ComponentStatus,
  Dropdown,
} from '@influxdata/clockface'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import TimeRangeDropdown from 'src/flows/components/header/TimeRangeDropdown'
import Submit from 'src/flows/components/header/Submit'
import PresentationMode from 'src/flows/components/header/PresentationMode'
import RenamablePageTitle from 'src/pageLayout/components/RenamablePageTitle'
import {DEFAULT_PROJECT_NAME} from 'src/flows'
import {serialize} from 'src/flows/context/flow.list'
import {FeatureFlag} from 'src/shared/utils/featureFlag'
import {updatePinnedItemByParam} from 'src/shared/contexts/pinneditems'
import {getOrg} from 'src/organizations/selectors'
import {getAuthorizations} from 'src/client/generatedRoutes'
import {RemoteDataState} from 'src/types'

interface Token {
  token: string
  description: string
}

interface Share {
  id: string
  accessID: string
}

const FlowHeader: FC = () => {
  const {flow, updateOther, id} = useContext(FlowContext)
  const {id: orgID} = useSelector(getOrg)
  const [sharing, setSharing] = useState(false)
  const [token, setToken] = useState<Token>()
  const [loadingToken, setLoadingToken] = useState(RemoteDataState.NotStarted)
  const [tokens, setTokens] = useState<Token[]>([])
  const [share, setShare] = useState<Share>()
  const [linkLoading, setLinkLoading] = useState(RemoteDataState.NotStarted)

  useEffect(() => {
    // TODO: once we have a generated func from swagger, use that
    fetch(`/api/v2private/notebooks/share?notebookID=${id}`).then(res =>
      res.json().then(data => {
        if (data) {
          // TODO: handle there being multiple links?
          setShare({id: data[0].id, accessID: data[0].accessID})
        }
      })
    )
  }, [id])

  const handleRename = (name: string) => {
    updateOther({name})
    try {
      updatePinnedItemByParam(id, {name})
    } catch (err) {
      console.error(err)
    }
  }

  const showShare = () => {
    setSharing(true)
    setLoadingToken(RemoteDataState.Loading)
    getAuthorizations({query: {orgID}}).then(resp => {
      if (resp.status !== 200) {
        return
      }

      setLoadingToken(RemoteDataState.Done)
      const _tokens = resp.data.authorizations.map(a => ({
        token: a.token,
        description: a.description || 'Describe this token',
      }))

      setTokens(_tokens)
    })
  }

  const hideShare = () => {
    setSharing(false)
    setToken(null)
    setLoadingToken(RemoteDataState.NotStarted)
  }

  const deleteShare = () => {
    hideShare()
    // TODO: once we have a generated func from swagger, use that
    fetch(`/api/v2private/notebooks/share/${share.id}`, {
      method: 'DELETE',
    })
      .then(() => {
        hideShare()
        setShare(null)
      })
      .catch(() => console.error('failed to delete share')) // TODO send a notification
  }

  const generateLink = () => {
    setLinkLoading(RemoteDataState.Loading)
    // TODO: once we have a generated func from swagger, use that
    fetch(`/api/v2private/notebooks/share`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        notebookID: id,
        orgID,
        token: token.token,
        region: window.location.hostname,
      }),
    }).then(res =>
      res.json().then(data => {
        setLinkLoading(RemoteDataState.Done)
        setShare({id: data.id, accessID: data.accessID})
      })
    )
  }

  const printJSON = () => {
    /* eslint-disable no-console */
    console.log(JSON.stringify(serialize(flow, orgID), null, 2))
    /* eslint-enable no-console */
  }

  if (!flow) {
    return null
  }

  let tokenDropdownStatus = ComponentStatus.Disabled

  if (loadingToken === RemoteDataState.Loading) {
    tokenDropdownStatus = ComponentStatus.Loading
  }
  if (loadingToken === RemoteDataState.Done && tokens.length) {
    tokenDropdownStatus = ComponentStatus.Default
  }

  let linkGenerationStatus = ComponentStatus.Disabled

  if (linkLoading === RemoteDataState.Loading) {
    linkGenerationStatus = ComponentStatus.Loading
  } else if (!!token) {
    linkGenerationStatus = ComponentStatus.Default
  }

  const tokenOptions = tokens.map(t => (
    <Dropdown.Item
      key={t.token}
      value={t.token}
      selected={t.token === token?.token}
      title={t.description}
      className="share-token--option"
      onClick={() => setToken(t)}
    >
      <h1>{t.description}</h1>
      <h3>{t.token}</h3>
    </Dropdown.Item>
  ))

  return (
    <>
      <Page.Header fullWidth>
        <RenamablePageTitle
          onRename={handleRename}
          name={flow.name}
          placeholder={DEFAULT_PROJECT_NAME}
          maxLength={50}
        />
      </Page.Header>
      {!sharing && (
        <Page.ControlBar fullWidth>
          <Page.ControlBarLeft>
            <Submit />
          </Page.ControlBarLeft>
          <Page.ControlBarRight>
            <PresentationMode />
            <TimeZoneDropdown />
            <TimeRangeDropdown />
            <FeatureFlag name="shareNotebook">
              <SquareButton
                icon={IconFont.Share}
                onClick={showShare}
                color={ComponentColor.Default}
                titleText="Share Notebook"
              />
            </FeatureFlag>
            <FeatureFlag name="flow-snapshot">
              <SquareButton
                icon={IconFont.Export}
                onClick={printJSON}
                color={ComponentColor.Default}
                titleText="Export Notebook"
              />
            </FeatureFlag>
          </Page.ControlBarRight>
        </Page.ControlBar>
      )}
      {!!sharing && !share && (
        <Page.ControlBar fullWidth>
          <Page.ControlBarRight>
            <p className="share-token--steps">
              Choose an{' '}
              <Link to={`/orgs/${orgID}/load-data/tokens`}>API Token</Link>{' '}
              scoped to the resources you want to share
            </p>
            <Dropdown
              button={(active, onClick) => (
                <Dropdown.Button
                  onClick={onClick}
                  active={active}
                  status={tokenDropdownStatus}
                >
                  {token ? token.description : 'Select an API Token'}
                </Dropdown.Button>
              )}
              menu={onCollapse => (
                <Dropdown.Menu onCollapse={onCollapse}>
                  {tokenOptions}
                </Dropdown.Menu>
              )}
              style={{width: '250px', flex: '0 0 250px'}}
            />
            <SquareButton
              icon={IconFont.Checkmark}
              onClick={generateLink}
              color={ComponentColor.Success}
              status={linkGenerationStatus}
              titleText="Set Token"
            />
            <SquareButton
              icon={IconFont.Remove}
              onClick={hideShare}
              color={ComponentColor.Danger}
              titleText="Cancel"
            />
          </Page.ControlBarRight>
        </Page.ControlBar>
      )}
      {!!sharing && !!share && (
        <Page.ControlBar fullWidth>
          <Page.ControlBarRight>
            <p className="share-token--link">
              Share with{' '}
              <a
                href={`${window.location.origin}/share/${share.accessID}`}
                target="_blank"
              >
                {`${window.location.origin}/share/${share.accessID}`}
              </a>
            </p>
            <SquareButton
              icon={IconFont.Trash}
              onClick={deleteShare}
              color={ComponentColor.Danger}
              titleText="Delete"
            />
            <SquareButton
              icon={IconFont.Remove}
              onClick={hideShare}
              color={ComponentColor.Default}
              titleText="Cancel"
            />
          </Page.ControlBarRight>
        </Page.ControlBar>
      )}
    </>
  )
}

export default () => (
  <AppSettingProvider>
    <FlowHeader />
  </AppSettingProvider>
)
