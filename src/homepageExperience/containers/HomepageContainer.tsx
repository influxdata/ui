import React, {FC, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Link} from 'react-router-dom'

import {
  AlignItems,
  Columns,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Grid,
  Heading,
  HeadingElement,
  Icon,
  IconFont,
  InfluxColors,
  Page,
  ResourceCard,
  SquareGrid,
} from '@influxdata/clockface'

import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {
  CLIIcon,
  GoIcon,
  NodejsIcon,
  PythonIcon,
  TelegrafIcon,
} from 'src/homepageExperience/components/HomepageIcons'

import './HomepageContainer.scss'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import UsageProvider from 'src/usage/context/usage'
import Resources from 'src/me/components/Resources'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getAllTelegrafs} from 'src/resources/selectors'

// Thunks
import {getTelegrafs} from 'src/telegrafs/actions/thunks'

export const HomepageContainer: FC = () => {
  const dispatch = useDispatch()
  const org = useSelector(getOrg)
  const telegrafs = useSelector(getAllTelegrafs)
  const pythonWizardLink = `/orgs/${org.id}/new-user-setup/python`
  const cliPageLink = `/orgs/${org.id}/load-data/file-upload/csv`
  const telegrafPageLink = `/orgs/${org.id}/load-data/telegrafs`
  const newTelegrafPageLink = `/orgs/${org.id}/load-data/telegrafs/new`
  const golangLink = `/orgs/${org.id}/new-user-setup/golang`
  const loadDataSourcesLink = `/orgs/${org.id}/load-data/sources`
  const javaScriptNodeLink = `/orgs/${org.id}/new-user-setup/nodejs`

  const cardStyle = {minWidth: '200px'}
  const linkStyle = {color: InfluxColors.Grey75}
  const moreStyle = {height: '100%', ...linkStyle}

  const squareGridCardSize = '200px'

  useEffect(() => {
    dispatch(getTelegrafs)
  }, [telegrafs]) // eslint-disable-line react-hooks/exhaustive-deps

  const telegrafLink = () => {
    if (!telegrafs.length) {
      return newTelegrafPageLink
    }
    return telegrafPageLink
  }

  // events handling
  const logGoWizardClick = () => {
    event('firstMile.goWizard.clicked')
  }

  const logNodeJSWizardClick = () => {
    event('firstMile.nodejsWizard.clicked')
  }

  const logPythonWizardClick = () => {
    event('firstMile.pythonWizard.clicked')
  }

  const logMoreButtonClick = () => {
    event('firstMile.moreButton.clicked')
  }

  const logCLIButtonClick = () => {
    event('firstMile.CLIButton.clicked')
  }

  const logTelegrafButtonClick = () => {
    event('firstMile.telegrafButton.clicked')
  }

  return (
    <>
      <Page titleTag={pageTitleSuffixer(['Get Started'])}>
        <Page.Header fullWidth={false}>
          <Heading
            id="first-mile--header"
            element={HeadingElement.H1}
            testID="home-page--header"
          >
            Get Started
          </Heading>
          <RateLimitAlert location="firstMile.homepage" />
        </Page.Header>
        <Page.Contents scrollable={true} fullWidth={false}>
          <Grid>
            <Grid.Row>
              <Grid.Column widthSM={Columns.Eight} widthMD={Columns.Nine}>
                <FlexBox
                  direction={FlexDirection.Column}
                  alignItems={AlignItems.Stretch}
                >
                  <h5>
                    Write and query data using the programming language of your
                    choice
                  </h5>
                  <SquareGrid
                    cardSize={squareGridCardSize}
                    gutter={ComponentSize.Large}
                  >
                    <ResourceCard style={cardStyle}>
                      <Link
                        to={pythonWizardLink}
                        style={linkStyle}
                        onClick={logPythonWizardClick}
                      >
                        <div
                          className="homepage-wizard-language-tile"
                          data-testid="homepage-wizard-language-tile--python"
                        >
                          <h5>Python</h5>
                          {PythonIcon}
                        </div>
                      </Link>
                    </ResourceCard>
                    <ResourceCard style={cardStyle}>
                      <Link
                        to={javaScriptNodeLink}
                        style={linkStyle}
                        onClick={logNodeJSWizardClick}
                      >
                        <div className="homepage-wizard-language-tile">
                          <h5>JavaScript/Node.js</h5>
                          {NodejsIcon}
                        </div>
                      </Link>
                    </ResourceCard>
                    <ResourceCard style={cardStyle}>
                      <Link
                        to={golangLink}
                        style={linkStyle}
                        onClick={logGoWizardClick}
                      >
                        <div className="homepage-wizard-language-tile">
                          <h5>Go</h5>
                          {GoIcon}
                        </div>
                      </Link>
                    </ResourceCard>
                    <ResourceCard style={cardStyle}>
                      <Link
                        to={loadDataSourcesLink}
                        style={moreStyle}
                        onClick={logMoreButtonClick}
                      >
                        <div className="homepage-wizard-language-tile">
                          <span>
                            <h5>
                              MORE <Icon glyph={IconFont.ArrowRight_New} />
                            </h5>
                          </span>
                        </div>
                      </Link>
                    </ResourceCard>
                  </SquareGrid>
                  <hr style={{marginTop: '32px'}} />
                  <Link
                    to={cliPageLink}
                    style={linkStyle}
                    onClick={logCLIButtonClick}
                  >
                    <div className="homepage-write-data-tile">
                      <div className="tile-icon-text-wrapper">
                        <div className="icon">{CLIIcon}</div>
                        <div>
                          <h4>CLI</h4>
                          <h6>
                            Write and query data using the Command Line
                            Interface
                          </h6>
                        </div>
                      </div>

                      <Icon
                        glyph={IconFont.ArrowRight_New}
                        className="arrow-button"
                      />
                    </div>
                  </Link>
                  <Link
                    to={telegrafLink}
                    style={linkStyle}
                    onClick={logTelegrafButtonClick}
                  >
                    <div className="homepage-write-data-tile">
                      <div className="tile-icon-text-wrapper">
                        <div className="icon">{TelegrafIcon}</div>
                        <div>
                          <h4>Server Agent (Telegraf)</h4>
                          <h6>
                            Easily collect and write data using custom
                            stand-alone agent plugins
                          </h6>
                        </div>
                      </div>

                      <Icon
                        glyph={IconFont.ArrowRight_New}
                        className="arrow-button"
                      />
                    </div>
                  </Link>
                </FlexBox>
              </Grid.Column>
              <Grid.Column
                widthSM={Columns.Four}
                widthMD={Columns.Three}
                style={{marginTop: '-8px'}}
              >
                {isFlagEnabled('uiUnificationFlag') ? (
                  <UsageProvider>
                    <Resources style={{backgroundColor: InfluxColors.Grey5}} />
                  </UsageProvider>
                ) : (
                  <Resources style={{backgroundColor: InfluxColors.Grey5}} />
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Page.Contents>
      </Page>
    </>
  )
}
