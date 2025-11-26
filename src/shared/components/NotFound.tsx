import {
  AlignItems,
  AppWrapper,
  ComponentSize,
  FlexBox,
  FlexBoxChild,
  FlexDirection,
  FunnelPage,
  Icon,
  IconFont,
  InfluxColors,
  JustifyContent,
  Panel,
} from '@influxdata/clockface'
import React, {useState, FC, useCallback, useEffect, useRef} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory, useLocation} from 'react-router-dom'
import {getOrg} from 'src/organizations/selectors'
import {getOrg as fetchOrg} from 'src/organizations/apis'

// Actions
import {setCurrentPage} from 'src/shared/reducers/currentPage'
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Utils
import {buildDeepLinkingMap} from 'src/utils/deepLinks'
import {event} from 'src/cloud/utils/reporting'

// Components
import LogoWithCubo from 'src/checkout/LogoWithCubo'
import GetInfluxButton from 'src/shared/components/GetInfluxButton'
import {Organization} from 'src/types'

// Constants
import {CLOUD} from 'src/shared/constants'

// API
import {fetchDefaultAccountDefaultOrg} from 'src/identity/apis/org'

const NotFoundNew: FC = () => {
  const dispatch = useDispatch()

  const handleContactSupport = () => {
    dispatch(showOverlay('contact-support', null, dismissOverlay))
  }

  return (
    <AppWrapper type="funnel" className="page-not-found" testID="not-found">
      <FunnelPage enableGraphic={true} className="page-not-found-funnel">
        {CLOUD && (
          <FlexBox
            direction={FlexDirection.Row}
            margin={ComponentSize.Large}
            stretchToFitWidth={true}
            justifyContent={JustifyContent.SpaceBetween}
          >
            <LogoWithCubo />
            <GetInfluxButton />
          </FlexBox>
        )}
        <FlexBox
          className="page-not-found-content"
          direction={FlexDirection.Column}
          margin={ComponentSize.Large}
          stretchToFitWidth={true}
        >
          <h2 className="page-not-found-content-highlight">
            404: Page Not Found
          </h2>
          <div>Please refresh the page or check the URL and try again.</div>
        </FlexBox>
      </FunnelPage>
      <FunnelPage.Footer className="page-not-found-footer">
        <Panel
          className="page-not-found-panel"
          backgroundColor={InfluxColors.Grey15}
        >
          <FlexBox
            direction={FlexDirection.Column}
            className="page-not-found-panel-content"
            margin={ComponentSize.Small}
          >
            {CLOUD && (
              <FlexBoxChild className="page-not-found-panel-section">
                <div className="page-not-found-panel-title">
                  Not a URL issue?
                </div>
                <div>
                  <span>
                    The webpage you were trying to reach may have been removed
                    or your access to this page may have expired. Please{' '}
                    <a href="#" onClick={handleContactSupport}>
                      contact support
                    </a>
                    .
                  </span>
                </div>
              </FlexBoxChild>
            )}
            <FlexBoxChild className="page-not-found-panel-section">
              <div className="page-not-found-panel-title">
                Have more feedback?
              </div>
              <div>
                We welcome and encourage your feedback and bug reports for
                InfluxDB. The following resources are available:
              </div>
            </FlexBoxChild>
            <FlexBox alignItems={AlignItems.Stretch} stretchToFitWidth={true}>
              <FlexBoxChild className="page-not-found-community-links">
                <Icon glyph={IconFont.CuboSolid}></Icon>
                {/* Add rel options to avoid "tabnapping" */}
                <a
                  href="https://community.influxdata.com/"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  InfluxData Community
                </a>
              </FlexBoxChild>
              <FlexBoxChild className="page-not-found-community-links">
                <span className="slack-icon" />
                {/* Add rel options to avoid "tabnapping" */}
                <a
                  href="https://influxdata.com/slack/"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  InfluxDB Community Slack
                </a>
              </FlexBoxChild>
            </FlexBox>
          </FlexBox>
        </Panel>
        <FunnelPage.FooterSection>
          <FlexBox
            alignItems={AlignItems.Center}
            margin={ComponentSize.Large}
            justifyContent={JustifyContent.Center}
          ></FlexBox>
        </FunnelPage.FooterSection>
      </FunnelPage.Footer>
    </AppWrapper>
  )
}

const NotFound: FC = () => {
  const [isFetchingOrg, setIsFetchingOrg] = useState(false)
  const location = useLocation()
  const history = useHistory()
  const reduxOrg = useSelector(getOrg)
  const dispatch = useDispatch()

  const org = useRef<Organization>(reduxOrg)

  const handleDeepLink = useCallback(async () => {
    if (!org.current) {
      if (CLOUD) {
        try {
          setIsFetchingOrg(true)
          const defaultQuartzOrg = await fetchDefaultAccountDefaultOrg()
          org.current = defaultQuartzOrg
        } catch {
          history.push(`/no-orgs`)
          return
        }
      } else {
        setIsFetchingOrg(true)
        org.current = await fetchOrg()
      }
    }
    const deepLinkingMap = buildDeepLinkingMap(org.current?.id)

    if (deepLinkingMap.hasOwnProperty(location.pathname)) {
      event('deeplink', {from: location.pathname})
      history.replace(deepLinkingMap[location.pathname])
      return
    }
    setIsFetchingOrg(false)
  }, [history, location.pathname])

  useEffect(() => {
    if (CLOUD) {
      handleDeepLink()
    }
  }, [handleDeepLink])

  useEffect(() => {
    dispatch(setCurrentPage('not found'))
    return () => {
      dispatch(setCurrentPage('not set'))
    }
  }, [dispatch])

  if (isFetchingOrg) {
    // don't render anything if this component is actively fetching org id
    // this prevents popping in a 404 page then redirecting
    return null
  }

  return <NotFoundNew />
}

export default NotFound
