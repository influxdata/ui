import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {Link} from 'react-router-dom'

import {
  AlignItems,
  ComponentSize,
  FlexBox,
  Icon,
  IconFont,
  InfluxColors,
  JustifyContent,
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

export const HomepageContainer: FC = () => {
  const org = useSelector(getOrg)
  const pythonWizardLink = `/orgs/${org.id}/new-user-wizard/python`
  const cliPageLink = `/orgs/${org.id}/load-data/file-upload/csv`
  const telegrafPageLink = `/orgs/${org.id}/load-data/telegrafs`
  const javaScriptNodeLink = `/orgs/${org.id}/load-data/client-libraries/javascript-node`
  const golangLink = `/orgs/${org.id}/load-data/client-libraries/go`
  const loadDataSourcesLink = `/orgs/${org.id}/load-data/sources`

  const cardStyle = {maxWidth: '250px'}
  const linkStyle = {color: InfluxColors.Grey75}
  const moreStyle = {height: '100%'}

  return (
    <>
      <Page titleTag={pageTitleSuffixer(['Get Started'])}>
        <Page.Contents>
          <div className="homepage-container--wrapper">
            <div className="homepage-container">
              <h1>Get Started</h1>
              <h5>
                Write and query data using the programming language of your
                choice
              </h5>
              <FlexBox
                margin={ComponentSize.Large}
                alignItems={AlignItems.Stretch}
                justifyContent={JustifyContent.SpaceBetween}
              >
                <ResourceCard style={cardStyle}>
                  <Link to={pythonWizardLink} style={linkStyle}>
                    <div className="homepage-wizard-language-tile">
                      <h5>Python</h5>
                      {PythonIcon}
                    </div>
                  </Link>
                </ResourceCard>
                <ResourceCard style={cardStyle}>
                  <Link to={javaScriptNodeLink}>
                    <div className="homepage-wizard-language-tile">
                      <h5>JavaScript/Node.js</h5>
                      {JavascriptNodeJsIcon}
                    </div>
                  </Link>
                </ResourceCard>
                <ResourceCard style={cardStyle}>
                  <Link to={golangLink}>
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
              <hr style={{marginTop: '32px'}} />
              <Link to={cliPageLink} style={linkStyle}>
                <div className="homepage-write-data-tile">
                  <div className="tile-icon-text-wrapper">
                    <div className="icon">{CLIIcon}</div>
                    <div>
                      <h4>CLI</h4>
                      <h6>
                        Write and query data using the Command Line Interface
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
                        Easily collect and write data using custom stand-alone
                        agent plugins
                      </h6>
                    </div>
                  </div>

                  <Icon
                    glyph={IconFont.ArrowRight_New}
                    className="arrow-button"
                  />
                </div>
              </Link>
            </div>
          </div>
        </Page.Contents>
      </Page>
    </>
  )
}
