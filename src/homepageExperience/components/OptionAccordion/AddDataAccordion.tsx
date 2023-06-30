// Libraries
import React, {FC, useState} from 'react'
import {useHistory} from 'react-router-dom'

// Components
import {
  Button,
  ComponentSize,
  ComponentStatus,
  Dropdown,
  FlexBox,
  FlexBoxChild,
  IconFont,
  InfluxColors,
  JustifyContent,
} from '@influxdata/clockface'
import {OptionAccordion} from 'src/homepageExperience/components/OptionAccordion/OptionAccordion'
import {OptionAccordionElement} from 'src/homepageExperience/components/OptionAccordion/OptionAccordionElement'
import {OptionLink} from './OptionLink'

// Utils
import {useSelector} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'

export const AddDataAccordion: FC = () => {
  const orgID = useSelector(getOrg).id
  const history = useHistory()
  const [language, setLanguage] = useState('Select Programming Language')
  const optionId = 'addData'

  const handleTelegrafClick = () => {
    event(`homeOptions.${optionId}.telegraf.clicked`)
    history.push(`/orgs/${orgID}/load-data/telegrafs`)
  }

  const handleAppCodeClick = () => {
    const lang = languageList[language].split('/').pop()
    event(`homeOptions.${optionId}.appCode.${lang}.clicked`)
    history.push(`/orgs/${orgID}/${languageList[language]}`)
  }

  const handleUploadCSVClick = () => {
    event(`homeOptions.${optionId}.uploadCSV.clicked`)
    history.push(`/orgs/${orgID}/load-data/file-upload/annotated_csv`)
  }

  const handleUploadLPClick = () => {
    event(`homeOptions.${optionId}.uploadLP.clicked`)
    history.push(`/orgs/${orgID}/load-data/file-upload/lp`)
  }

  const handleAPIClick = () => {
    event(`homeOptions.${optionId}.apiDocs.clicked`)
  }

  const handleCLIClick = () => {
    event(`homeOptions.${optionId}.cliDocs.clicked`)
  }

  const languageList = {
    Arduino: 'new-user-setup/arduino',
    'C#': 'new-user-setup/csharp',
    Dart: 'load-data/client-libraries/dart',
    Go: 'new-user-setup/golang',
    Java: 'new-user-setup/java',
    Kotlin: 'load-data/client-libraries/kotlin',
    'Node.js': 'new-user-setup/nodejs',
    PHP: 'load-data/client-libraries/php',
    Python: 'new-user-setup/python',
    R: 'load-data/client-libraries/r',
    Ruby: 'load-data/client-libraries/ruby',
    Scala: 'load-data/client-libraries/scala',
    Swift: 'load-data/client-libraries/swift',
  }

  const dropdownList = Object.entries(languageList).map(([lang]) => (
    <Dropdown.Item value={lang} onClick={() => setLanguage(lang)} key={lang}>
      {lang}
    </Dropdown.Item>
  ))

  return (
    <OptionAccordion
      headerIcon={IconFont.Upload_New}
      headerIconColor={InfluxColors.Chartreuse}
      headerTitle="Add Data"
      headerDescription="Write data into your database with our reporting agent, programmatically, API, CLI, or upload a CSV or Line Protocol File."
      optionId={optionId}
      bodyContent={
        <>
          <OptionAccordionElement
            elementTitle="Telegraf Reporting Agent"
            elementDescription="Use the Telegraf reporting agent to collect metrics from 200+ data sources."
            cta={() => {
              return (
                <Button
                  text="Configure Agent"
                  size={ComponentSize.ExtraSmall}
                  onClick={handleTelegrafClick}
                />
              )
            }}
          />
          <OptionAccordionElement
            elementTitle="Application Code"
            elementDescription="Write data into your database directly with your application code."
            cta={() => {
              return (
                <FlexBox
                  justifyContent={JustifyContent.FlexEnd}
                  margin={ComponentSize.Small}
                  className="option-accordion--dropdown"
                >
                  <FlexBoxChild>
                    <Dropdown
                      button={(active, onClick) => (
                        <Dropdown.Button
                          active={active}
                          size={ComponentSize.ExtraSmall}
                          onClick={onClick}
                        >
                          {language}
                        </Dropdown.Button>
                      )}
                      menu={onCollapse => (
                        <Dropdown.Menu onCollapse={onCollapse}>
                          {dropdownList}
                        </Dropdown.Menu>
                      )}
                    />
                  </FlexBoxChild>
                  <FlexBoxChild>
                    <Button
                      text="View Guide"
                      size={ComponentSize.ExtraSmall}
                      status={
                        language === 'Select Programming Language'
                          ? ComponentStatus.Disabled
                          : ComponentStatus.Default
                      }
                      onClick={handleAppCodeClick}
                    />
                  </FlexBoxChild>
                </FlexBox>
              )
            }}
          />
          <OptionAccordionElement
            elementTitle="API"
            elementDescription="Use the InfluxDB REST API to write data into your databases."
            cta={() => {
              return (
                <OptionLink
                  title="View API Docs"
                  href="https://docs.influxdata.com/influxdb/cloud-iox/api/#operation/PostWrite"
                  onClick={handleAPIClick}
                />
              )
            }}
          />
          <OptionAccordionElement
            elementTitle="CLI"
            elementDescription="Use the InfluxDB Command Line Interface to write data into your databases."
            cta={() => {
              return (
                <OptionLink
                  title="View CLI Docs"
                  href="https://docs.influxdata.com/influxdb/cloud-iox/write-data/csv/influx-cli/"
                  onClick={handleCLIClick}
                />
              )
            }}
          />
          <OptionAccordionElement
            elementTitle="Upload CSV or Line Protocol File"
            elementDescription="Upload a file formatted as CSV or Line Protocol to write data into your databases."
            cta={() => {
              return (
                <>
                  <FlexBox
                    justifyContent={JustifyContent.FlexEnd}
                    margin={ComponentSize.Small}
                  >
                    <FlexBoxChild>
                      <Button
                        text="Upload CSV"
                        size={ComponentSize.ExtraSmall}
                        onClick={handleUploadCSVClick}
                      />
                    </FlexBoxChild>
                    <FlexBoxChild>
                      <Button
                        text="Upload Line Protocol"
                        size={ComponentSize.ExtraSmall}
                        onClick={handleUploadLPClick}
                      />
                    </FlexBoxChild>
                  </FlexBox>
                </>
              )
            }}
          />
        </>
      }
    />
  )
}
