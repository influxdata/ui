import {
  AlignItems,
  AppWrapper,
  ComponentSize,
  FlexBox,
  FunnelPage,
  JustifyContent,
} from '@influxdata/clockface'
import React, {FC} from 'react'
import LogoWithCubo from 'src/checkout/LogoWithCubo'
import {isFlagEnabled} from '../utils/featureFlag'

const NotFoundNew: FC = () => (
  <AppWrapper type="funnel">
    <FunnelPage
      logo={<LogoWithCubo />}
      enableGraphic={true}
      className="page-not-found"
    >
      blah
    </FunnelPage>
    <FunnelPage.Footer className="page-not-found-footer">
      <FunnelPage.FooterSection>
        <FlexBox
          alignItems={AlignItems.Center}
          margin={ComponentSize.Large}
          justifyContent={JustifyContent.Center}
        >
          something
        </FlexBox>
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
