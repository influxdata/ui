// Libraries
import React, {FC, useState} from 'react'
import {useSelector} from 'react-redux'

// Contexts
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'

// Components
import {ArduinoIcon} from 'src/homepageExperience/components/HomepageIcons'
import {ExecuteAggregateQuery} from 'src/homepageExperience/components/steps/arduino/ExecuteAggregateQuery'
import {ExecuteQuery} from 'src/homepageExperience/components/steps/arduino/ExecuteQuery'
import {Finish} from 'src/homepageExperience/components/steps/Finish'
import {InitializeClient} from 'src/homepageExperience/components/steps/arduino/InitializeClient'
import {InstallDependencies} from 'src/homepageExperience/components/steps/arduino/InstallDependencies'
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {PrepareIde} from 'src/homepageExperience/components/steps/arduino/PrepareIde'
import {WizardContainer} from 'src/homepageExperience/containers/WizardContainer'
import {WriteData} from 'src/homepageExperience/components/steps/arduino/WriteData'

// Utils
import {isOrgIOx} from 'src/organizations/selectors'
import {
  HOMEPAGE_NAVIGATION_STEPS_ARDUINO,
  HOMEPAGE_NAVIGATION_STEPS_ARDUINO_WRITE_ONLY,
} from 'src/homepageExperience/utils'

export const ArduinoWizard: FC<{}> = () => {
  const [selectedBucket, setSelectedBucket] = useState<string>('sample-bucket')
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

  const renderSqlStep = (currentStep: number) => {
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

  const renderFluxStep = (currentStep: number) => {
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
        return <ExecuteQuery bucket={selectedBucket} />
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
        {currentStep =>
          isIOxOrg ? renderSqlStep(currentStep) : renderFluxStep(currentStep)
        }
      </WizardContainer>
    </WriteDataDetailsContextProvider>
  )
}
