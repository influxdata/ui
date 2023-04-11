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
  LinkButton,
} from '@influxdata/clockface'
import {OptionAccordion} from 'src/homepageExperience/components/OptionAccordion/OptionAccordion'
import {OptionAccordionElement} from 'src/homepageExperience/components/OptionAccordion/OptionAccordionElement'

// Utils
import {useSelector} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'

export const QueryDataAccordion: FC = () => {
  const orgID = useSelector(getOrg).id
  const history = useHistory()
  const [language, setLanguage] = useState('Select Programming Language')

  const handleDataExplorerClick = () => {
    history.push(`/orgs/${orgID}/data-explorer`)
  }

  const handleAppCodeClick = () => {
    history.push(`/orgs/${orgID}/${languageList[language]}`)
  }

  const languageList = {
    Go: 'new-user-setup/golang',
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
                          Select Programming Language
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
                <LinkButton
                  text="View API Docs"
                  size={ComponentSize.ExtraSmall}
                  href="https://docs.influxdata.com/influxdb/cloud-iox/reference/api/"
                  target="_blank"
                />
              )
            }}
          />
        </>
      }
    />
  )
}
