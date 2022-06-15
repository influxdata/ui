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
import React, {useState, FC, useCallback, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'
import {getOrg as fetchOrg} from 'src/organizations/apis'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {buildDeepLinkingMap} from 'src/utils/deepLinks'
import {event} from 'src/cloud/utils/reporting'

// Components
import LogoWithCubo from 'src/checkout/LogoWithCubo'
import GetInfluxButton from 'src/shared/components/GetInfluxButton'
import {useHistory, useLocation} from 'react-router-dom'

const NotFoundNew: FC = () => (
  <AppWrapper type="funnel" className="page-not-found">
    <FunnelPage enableGraphic={true} className="page-not-found-funnel">
      <FlexBox
        direction={FlexDirection.Row}
        margin={ComponentSize.Large}
        stretchToFitWidth={true}
        justifyContent={JustifyContent.SpaceBetween}
      >
        <LogoWithCubo />
        <GetInfluxButton />
      </FlexBox>
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
          <FlexBoxChild className="page-not-found-panel-section">
            <div className="page-not-found-panel-title">Not a URL issue?</div>
            <div>
              <span>
                The webpage you were trying to reach may have been removed or
                your access to this page may have expired.&nbsp;
                {/* Add rel options to avoid "tabnapping" */}
                <a
                  href="mailto:support@influxdata.com"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Contact InfluxData Support
                </a>
              </span>
            </div>
          </FlexBoxChild>
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

const NotFound: FC = () => {
  const [isFetchingOrg, setIsFetchingOrg] = useState(false)
  const location = useLocation()
  const history = useHistory()
  const org = useSelector(getOrg)

  const handleGetOrg = useCallback(async () => {
    await fetchOrg()
  }, [])

  useEffect(() => {
    if (isFlagEnabled('deepLinking')) {
      if (!org) {
        setIsFetchingOrg(true)
        handleGetOrg()
      }

      const deepLinkingMap = buildDeepLinkingMap(org)

      if (deepLinkingMap.hasOwnProperty(location.pathname)) {
        event('deeplink')
        history.replace(deepLinkingMap[location.pathname])
        return
      }
      setIsFetchingOrg(false)
    }
  }, [handleGetOrg, history, org])

  if (isFetchingOrg) {
    // don't render anything if this component is actively fetching org id
    // this prevents popping in a 404 page then redirecting
    return null
  }

  return <NotFoundNew />
}

export default NotFound
