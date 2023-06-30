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
  JustifyContent,
} from '@influxdata/clockface'
import {OptionAccordion} from 'src/homepageExperience/components/OptionAccordion/OptionAccordion'
import {OptionAccordionElement} from 'src/homepageExperience/components/OptionAccordion/OptionAccordionElement'
import {OptionLink} from './OptionLink'

// Utils
import {useSelector} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'

export const QueryDataAccordion: FC = () => {
  const orgID = useSelector(getOrg).id
  const history = useHistory()
  const [language, setLanguage] = useState('Select Programming Language')
  const optionId = 'queryData'

  const handleDataExplorerClick = () => {
    event(`homeOptions.${optionId}.dataExplorer.clicked`)
    history.push(`/orgs/${orgID}/data-explorer`)
  }

  const handleAppCodeClick = () => {
    const lang = languageList[language].split('/').pop()
    event(`homeOptions.${optionId}.appCode.${lang}.clicked`)
    history.push(`/orgs/${orgID}/${languageList[language]}`)
  }

  const handleAPIClick = () => {
    event(`homeOptions.${optionId}.apiDocs.clicked`)
  }

  const languageList = {
    'C#': 'new-user-setup/csharp',
    Go: 'new-user-setup/golang',
    Java: 'new-user-setup/java',
    Python: 'new-user-setup/python',
  }

  const dropdownList = Object.entries(languageList).map(([lang]) => (
    <Dropdown.Item value={lang} onClick={() => setLanguage(lang)} key={lang}>
      {lang}
    </Dropdown.Item>
  ))

  return (
    <OptionAccordion
      headerIcon={IconFont.Braces}
      headerIconColor="#53E51A"
      headerTitle="Query Data"
      headerDescription="Query your data with the UI, programmatically, or integrate with 3rd party tools."
      optionId="queryData"
      bodyContent={
        <>
          <OptionAccordionElement
            elementTitle="Data Explorer"
            elementDescription="Use the built-in Data Explorer to visually build SQL queries and browse your data."
            cta={() => {
              return (
                <Button
                  text="Go to Data Explorer"
                  size={ComponentSize.ExtraSmall}
                  onClick={handleDataExplorerClick}
                />
              )
            }}
          />
          <OptionAccordionElement
            elementTitle="Application Code"
            elementDescription="Query your data directly with your application code."
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
            elementDescription="Use the InfluxDB REST API to query data from your databases."
            cta={() => {
              return (
                <OptionLink
                  title="View API Docs"
                  href="https://docs.influxdata.com/influxdb/cloud-iox/reference/api/"
                  onClick={handleAPIClick}
                />
              )
            }}
          />
        </>
      }
    />
  )
}
