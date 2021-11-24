import {
  AlignItems,
  AppWrapper,
  ComponentSize,
  FlexBox,
  FunnelPage,
  Icon,
  IconFont,
  InfluxColors,
  JustifyContent,
  Panel,
} from '@influxdata/clockface'
import React, {FC} from 'react'
import LogoWithCubo from 'src/checkout/LogoWithCubo'
import {isFlagEnabled} from '../utils/featureFlag'

const NotFoundNew: FC = () => (
  <AppWrapper type="funnel" className="page-not-found">
    <FunnelPage
      logo={<LogoWithCubo />}
      enableGraphic={true}
      className="page-not-found-funnel"
    ></FunnelPage>
    <FunnelPage.Footer className="page-not-found-footer">
      <Panel
        className="page-not-found-panel"
        backgroundColor={InfluxColors.Grey15}
      >
        <div className="page-not-found-panel-content">
          <div className="page-not-found-panel-section">
            <div className="page-not-found-panel-title">Not a URL issue?</div>
            <div>
              <span>
                The webpage you were trying to reach may have been removed or
                your access to this page may have expired.&nbsp;
                <a href="" about="_blank">
                  Contact InfluxData Support
                </a>
              </span>
            </div>
          </div>
          <div className="page-not-found-panel-section">
            <div className="page-not-found-panel-title">
              Have more feedback?
            </div>
            <div>
              We welcome and encourage your feedback and bug reports for
              InfluxDB. The following resources are available:
            </div>
          </div>
          <FlexBox>
            <FlexBox className="page-not-found-community-links">
              <Icon glyph={IconFont.Cubouniform}></Icon>
              <a href="" about="_blank">
                InfluxData Community
              </a>
            </FlexBox>
            <FlexBox className="page-not-found-community-links">
              {/* TODO: Change with Slack Icon */}
              <Icon glyph={IconFont.NavChat}></Icon>
              <a href="" about="_blank">
                InfluxDB Community Slack
              </a>
            </FlexBox>
          </FlexBox>
        </div>
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
  console.log('ajajsjasas sdsdsdsss')
  if (isFlagEnabled('newNotFoundPage')) {
    return <NotFoundNew />
  }

  return <NotFoundOld />
}

export default NotFound
