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
import React, {FC} from 'react'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Components
import LogoWithCubo from 'src/checkout/LogoWithCubo'
import GetInfluxButton from 'src/shared/components/GetInfluxButton'


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
              <Icon glyph={IconFont.Cubouniform}></Icon>
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

const NotFoundOld: FC = () => (
  <div className="container-fluid" data-testid="not-found">
    <div className="panel">
      <div className="panel-heading text-center">
        <h1 className="deluxe">404</h1>
        <h4>Bummer! We couldn't find the page you were looking for</h4>
      </div>
    </div>
  </div>
)

const NotFound: FC = () => {
  if (isFlagEnabled('newNotFoundPage')) {
    return <NotFoundNew />
  }

  return <NotFoundOld />
}

export default NotFound
