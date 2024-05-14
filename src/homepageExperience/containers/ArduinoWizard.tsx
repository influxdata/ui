// Libraries
import React, {FC, useState} from 'react'
import {useSelector} from 'react-redux'

// Contexts
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'

// Components
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {PrepareIde} from 'src/homepageExperience/components/steps/arduino/PrepareIde'
import {InstallDependencies} from 'src/homepageExperience/components/steps/arduino/InstallDependencies'
import {InitializeClient} from 'src/homepageExperience/components/steps/arduino/InitializeClient'
import {WriteData} from 'src/homepageExperience/components/steps/arduino/WriteData'
import {ExecuteQuery} from 'src/homepageExperience/components/steps/arduino/ExecuteQuery'
import {ExecuteAggregateQuery} from 'src/homepageExperience/components/steps/arduino/ExecuteAggregateQuery'
import {Finish} from 'src/homepageExperience/components/steps/Finish'

import {WizardContainer} from 'src/homepageExperience/containers/WizardContainer'
import {ArduinoIcon} from 'src/homepageExperience/components/HomepageIcons'

// Selectors
import {isOrgIOx} from 'src/organizations/selectors'

// Utils
import {
  HOMEPAGE_NAVIGATION_STEPS_ARDUINO,
  HOMEPAGE_NAVIGATION_STEPS_ARDUINO_WRITE_ONLY,
} from 'src/homepageExperience/utils'

export const ArduinoWizard: FC<{}> = () => {
  const [selectedBucket, setSelectedBucket] = useState<string>('my-bucket')
  const [finishStepCompleted, setFinishStepCompleted] = useState<boolean>(false)
  const [tokenValue, setTokenValue] = useState<string | null>(null)
  const [finalFeedback, setFinalFeedback] = useState<number | null>(null)

  const isIOxOrg = useSelector(isOrgIOx)
  const subwayNavSteps = isIOxOrg
    ? HOMEPAGE_NAVIGATION_STEPS_ARDUINO_WRITE_ONLY
    : HOMEPAGE_NAVIGATION_STEPS_ARDUINO

  const handleMarkStepAsCompleted = () => {
    setFinishStepCompleted(true)
  }

  const renderStep = currentStep => {
    switch (currentStep) {
      case 1: {
        return <Overview wizard="arduinoWizard" />
      }
      case 2: {
        return <PrepareIde />
      }
      case 3: {
        return <InstallDependencies />
      }
      case 4: {
        return (
          <InitializeClient
            setTokenValue={setTokenValue}
            tokenValue={tokenValue}
            onSelectBucket={setSelectedBucket}
          />
        )
      }
      case 5: {
        return <WriteData bucket={selectedBucket} />
      }
      case 6: {
        if (isIOxOrg) {
          return (
            <Finish
              wizardEventName="arduinoWizard"
              markStepAsCompleted={handleMarkStepAsCompleted}
              finishStepCompleted={finishStepCompleted}
              finalFeedback={finalFeedback}
              setFinalFeedback={setFinalFeedback}
            />
          )
        } else {
          return <ExecuteQuery bucket={selectedBucket} />
        }
      }
      case 7: {
        return <ExecuteAggregateQuery bucket={selectedBucket} />
      }
      case 8: {
        return (
          <Finish
            wizardEventName="arduinoWizard"
            markStepAsCompleted={handleMarkStepAsCompleted}
            finishStepCompleted={finishStepCompleted}
            finalFeedback={finalFeedback}
            setFinalFeedback={setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="arduinoWizard" />
      }
    }
  }

  return (
    <WriteDataDetailsContextProvider>
      <WizardContainer
        icon={ArduinoIcon}
        subwayNavSteps={subwayNavSteps}
        language="arduino"
        languageTitle="Arduino"
      >
        {currentStep => renderStep(currentStep)}
      </WizardContainer>
    </WriteDataDetailsContextProvider>
  )
}
