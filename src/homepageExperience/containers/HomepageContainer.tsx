import React, {CSSProperties, FC, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
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
  JustifyContent,
  Page,
  ResourceCard,
  SquareGrid,
} from '@influxdata/clockface'

import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {
  ArduinoIcon,
  CLIIcon,
  GoIcon,
  MQTTIcon,
  NodejsIcon,
  PythonIcon,
  TelegrafIcon,
} from 'src/homepageExperience/components/HomepageIcons'

import './HomepageContainer.scss'

// Utils
import {event} from 'src/cloud/utils/reporting'
import UsageProvider from 'src/usage/context/usage'
import Resources from 'src/me/components/Resources'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getAllTelegrafs} from 'src/resources/selectors'

// Thunks
import {getTelegrafs} from 'src/telegrafs/actions/thunks'
import {CLOUD} from 'src/shared/constants'

export const HomepageContainer: FC = () => {
  const dispatch = useDispatch()
  const org = useSelector(getOrg)
  const telegrafs = useSelector(getAllTelegrafs)
  const arduinoLink = `/orgs/${org.id}/new-user-setup/arduino`
  const pythonWizardLink = `/orgs/${org.id}/new-user-setup/python`
  const cliPageLink = `/orgs/${org.id}/new-user-setup/cli`
  const mqttPageLink = `/orgs/${org.id}/load-data/subscriptions/create`
  const telegrafPageLink = `/orgs/${org.id}/load-data/telegrafs`
  const newTelegrafPageLink = `/orgs/${org.id}/load-data/telegrafs/new`
  const golangLink = `/orgs/${org.id}/new-user-setup/golang`
  const loadDataSourcesLink = `/orgs/${org.id}/load-data/sources`
  const javaScriptNodeLink = `/orgs/${org.id}/new-user-setup/nodejs`

  const cardStyle = {minWidth: '200px'}
  const linkStyle = {color: InfluxColors.Grey75}
  // checks for
  const inlineViewMoreStyle = {
    marginTop: '8px',
  } as CSSProperties

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
  const logArduinoWizardClick = () => {
    event('firstMile.arduinoWizard.clicked')
  }
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

  const logMQTTButtonClick = () => {
    event('firstMile.MQTTButton.clicked')
  }

  const logTelegrafButtonClick = () => {
    event('firstMile.telegrafButton.clicked')
  }

  return (
    <>
      <Page titleTag={pageTitleSuffixer(['Get Started'])}>
        <Page.Header fullWidth={true}>
          <Heading
            id="first-mile--header"
            element={HeadingElement.H1}
            testID="home-page--header"
          >
            Get Started
          </Heading>
        </Page.Header>
        <Page.Contents scrollable={true} fullWidth={true}>
          <Grid>
            <Grid.Row>
              <Grid.Column widthSM={Columns.Eight} widthMD={Columns.Nine}>
                <FlexBox
                  direction={FlexDirection.Column}
                  alignItems={AlignItems.Stretch}
                >
                  {isFlagEnabled('ioxOnboarding') ? (
                    <>
                      <h3>Write & query from your application</h3>
                      <Link
                        to={pythonWizardLink}
                        style={linkStyle}
                        onClick={logPythonWizardClick}
                      >
                        <div
                          className="homepage-write-data-tile"
                          data-testid="homepage-wizard-language-tile--python"
                        >
                          <div className="tile-icon-text-wrapper">
                            <div className="icon">{PythonIcon}</div>
                            <div>
                              <h4>Python</h4>
                              <h6>
                                Integrate with your own application code using
                                Python.
                              </h6>
                            </div>
                          </div>
                          <Icon
                            glyph={IconFont.ArrowRight_New}
                            className="arrow-button"
                          />
                        </div>
                      </Link>
                    </>
                  ) : (
                    <>
                      <h5>
                        Write and query data using the programming language of
                        your choice
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
                              <h5>Node.js</h5>
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
                            to={arduinoLink}
                            style={linkStyle}
                            onClick={logArduinoWizardClick}
                          >
                            <div
                              className="homepage-wizard-language-tile"
                              data-testid="homepage-wizard-language-tile--arduino"
                            >
                              <h5>Arduino</h5>
                              {ArduinoIcon}
                            </div>
                          </Link>
                        </ResourceCard>
                      </SquareGrid>
                      <FlexBox justifyContent={JustifyContent.FlexStart}>
                        <Link
                          to={loadDataSourcesLink}
                          onClick={logMoreButtonClick}
                          style={inlineViewMoreStyle}
                        >
                          View more
                        </Link>
                      </FlexBox>
                    </>
                  )}
                  <hr style={{marginTop: '8px'}} />
                  {isFlagEnabled('subscriptionsUI') && (
                    <Link
                      to={mqttPageLink}
                      style={linkStyle}
                      onClick={logMQTTButtonClick}
                    >
                      <div
                        className="homepage-write-data-tile"
                        data-testid="homepage-wizard-tile--mqtt"
                      >
                        <div className="tile-icon-text-wrapper">
                          <div className="icon">{MQTTIcon}</div>
                          <div>
                            <h4>Native MQTT</h4>
                            <h6>
                              Connect to your MQTT subscription in the cloud.
                            </h6>
                          </div>
                        </div>

                        <Icon
                          glyph={IconFont.ArrowRight_New}
                          className="arrow-button"
                        />
                      </div>
                    </Link>
                  )}
                  <Link
                    to={cliPageLink}
                    style={linkStyle}
                    onClick={logCLIButtonClick}
                  >
                    <div
                      className="homepage-write-data-tile"
                      data-testid="homepage-wizard-tile--cli"
                    >
                      <div className="tile-icon-text-wrapper">
                        <div className="icon">{CLIIcon}</div>
                        <div>
                          <h4>InfluxDB CLI</h4>
                          <h6>
                            Write and query data using the InfluxDB Command Line
                            Interface. Supports CSV and Line Protocol.
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
              <Grid.Column widthSM={Columns.Four} widthMD={Columns.Three}>
                {CLOUD ? (
                  <UsageProvider>
                    <Resources />
                  </UsageProvider>
                ) : (
                  <Resources />
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Page.Contents>
      </Page>
    </>
  )
}
