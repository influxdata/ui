// Libraries
import React, {FC, ReactChild, useState} from 'react'
import classnames from 'classnames'

// Components
import {
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  Page,
  SubwayNav,
} from '@influxdata/clockface'

// Utils
import {event, normalizeEventName} from 'src/cloud/utils/reporting'
import {scrollNextPageIntoView} from 'src/homepageExperience/utils'

interface Props {
  children: (currentStep: number) => ReactChild
  icon?: JSX.Element
  language: string
  languageTitle: string
  subwayNavSteps: any[]
}

export const WizardContainer: FC<Props> = ({
  children,
  icon,
  language,
  languageTitle,
  subwayNavSteps,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1)

  const handleNavClick = (clickedStep: number) => {
    setCurrentStep(clickedStep)
    event(
      `firstMile.${language}Wizard.subNav.clicked`,
      {},
      {
        clickedButtonAtStep: normalizeEventName(
          subwayNavSteps[currentStep].name
        ),
        currentStep: normalizeEventName(subwayNavSteps[clickedStep - 1].name),
      }
    )
    console.log('currentStep', subwayNavSteps[clickedStep - 1].name)
    scrollNextPageIntoView()
  }

  const handleNextClick = () => {
    const newStep = Math.min(currentStep + 1, subwayNavSteps.length)
    setCurrentStep(newStep)
    event(
      `firstMile.${language}Wizard.next.clicked`,
      {},
      {
        clickedButtonAtStep: normalizeEventName(
          subwayNavSteps[newStep - 2].name
        ),
        currentStep: normalizeEventName(subwayNavSteps[newStep - 1].name),
      }
    )
    scrollNextPageIntoView()
  }

  const handlePreviousClick = () => {
    const newStep = Math.max(currentStep - 1, 1)
    setCurrentStep(newStep)
    event(
      `firstMile.${language}Wizard.previous.clicked`,
      {},
      {
        clickedButtonAtStep: normalizeEventName(subwayNavSteps[newStep].name),
        currentStep: normalizeEventName(subwayNavSteps[newStep - 1].name),
      }
    )
    scrollNextPageIntoView()
  }

  return (
    <Page>
      <Page.Header fullWidth={false} />
      <Page.Contents scrollable={true}>
        <div className="homepage-wizard-container">
          <aside className="homepage-wizard-container--subway">
            <div
              className="homepage-wizard-container--subway-inner"
              data-testid="subway-nav"
            >
              <SubwayNav
                currentStep={currentStep}
                onStepClick={handleNavClick}
                navigationSteps={subwayNavSteps}
                settingUpIcon={icon}
                settingUpText={languageTitle}
                setupTime="5 minutes"
              />
            </div>
          </aside>
          <div className="homepage-wizard-container--main">
            <div
              className={classnames('homepage-wizard-container--main-wrapper', {
                verticallyCentered:
                  currentStep === 1 || currentStep === subwayNavSteps.length,
              })}
            >
              {children(currentStep)}
              <div className="homepage-wizard-container-footer">
                <Button
                  onClick={handlePreviousClick}
                  text="Previous"
                  size={ComponentSize.Large}
                  color={ComponentColor.Tertiary}
                  status={
                    currentStep > 1
                      ? ComponentStatus.Default
                      : ComponentStatus.Disabled
                  }
                  testID={`${language}-prev-button`}
                />
                <Button
                  onClick={handleNextClick}
                  text="Next"
                  size={ComponentSize.Large}
                  color={ComponentColor.Primary}
                  status={
                    currentStep < subwayNavSteps.length
                      ? ComponentStatus.Default
                      : ComponentStatus.Disabled
                  }
                  testID={`${language}-next-button`}
                />
              </div>
            </div>
          </div>
        </div>
      </Page.Contents>
    </Page>
  )
}
