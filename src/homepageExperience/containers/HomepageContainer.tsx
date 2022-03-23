import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {Link} from 'react-router-dom'

import {
  AlignItems,
  Columns,
  ComponentSize,
  DapperScrollbars,
  FlexBox,
  FlexDirection,
  Grid,
  Icon,
  IconFont,
  InfluxColors,
  Page,
  ResourceCard,
} from '@influxdata/clockface'

import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {getOrg} from 'src/organizations/selectors'
import {
  CLIIcon,
  GoIcon,
  JavascriptNodeJsIcon,
  PythonIcon,
  TelegrafIcon,
} from 'src/homepageExperience/components/HomepageIcons'

import './HomepageContainer.scss'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import UsageProvider from 'src/usage/context/usage'
import Resources from 'src/me/components/Resources'

export const HomepageContainer: FC = () => {
  const org = useSelector(getOrg)
  const pythonWizardLink = `/orgs/${org.id}/new-user-wizard/python`
  const cliPageLink = `/orgs/${org.id}/load-data/file-upload/csv`
  const telegrafPageLink = `/orgs/${org.id}/load-data/telegrafs`
  const javaScriptNodeLink = `/orgs/${org.id}/load-data/client-libraries/javascript-node`
  const golangLink = `/orgs/${org.id}/load-data/client-libraries/go`
  const loadDataSourcesLink = `/orgs/${org.id}/load-data/sources`

  const cardStyle = {minWidth: '200px'}
  const linkStyle = {color: InfluxColors.Grey75}
  const moreStyle = {height: '100%', ...linkStyle}

  // events handling
  const logPythonEvent = () => {
    event('firstMile.pythonWizard.clicked')
  }

  return (
    <>
      <Page titleTag={pageTitleSuffixer(['Get Started'])}>
        <Page.Contents scrollable={true} fullWidth={false}>
          <Grid>
            <Grid.Row>
              <Grid.Column widthSM={Columns.Eight} widthMD={Columns.Nine}>
                <FlexBox
                  direction={FlexDirection.Column}
                  alignItems={AlignItems.Stretch}
                >
                  <h1>Get Started</h1>
                  <h5>
                    Write and query data using the programming language of your
                    choice
                  </h5>
                  <DapperScrollbars autoSizeHeight={true} autoHide={true}>
                    <FlexBox
                      margin={ComponentSize.Large}
                      alignItems={AlignItems.Stretch}
                      stretchToFitWidth={false}
                    >
                      <ResourceCard style={cardStyle}>
                        <Link
                          to={pythonWizardLink}
                          style={linkStyle}
                          onClick={logPythonEvent}
                        >
                          <div className="homepage-wizard-language-tile">
                            <h5>Python</h5>
                            {PythonIcon}
                          </div>
                        </Link>
                      </ResourceCard>
                      <ResourceCard style={cardStyle}>
                        <Link to={javaScriptNodeLink} style={linkStyle}>
                          <div className="homepage-wizard-language-tile">
                            <h5>JavaScript/Node.js</h5>
                            {JavascriptNodeJsIcon}
                          </div>
                        </Link>
                      </ResourceCard>
                      <ResourceCard style={cardStyle}>
                        <Link to={golangLink} style={linkStyle}>
                          <div className="homepage-wizard-language-tile">
                            <h5>Go</h5>
                            {GoIcon}
                          </div>
                        </Link>
                      </ResourceCard>
                      <ResourceCard style={cardStyle}>
                        <Link to={loadDataSourcesLink} style={moreStyle}>
                          <div className="homepage-wizard-language-tile">
                            <span>
                              <h5>
                                MORE <Icon glyph={IconFont.ArrowRight_New} />
                              </h5>
                            </span>
                          </div>
                        </Link>
                      </ResourceCard>
                    </FlexBox>
                  </DapperScrollbars>
                  <hr style={{marginTop: '32px'}} />
                  <Link to={cliPageLink} style={linkStyle}>
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
                  <Link to={telegrafPageLink} style={linkStyle}>
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
                style={{marginTop: '40px'}}
              >
                {isFlagEnabled('uiUnificationFlag') ? (
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
