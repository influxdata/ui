// Libraries
import React, {FC, useState} from 'react'
import {useSelector} from 'react-redux'

// Contexts
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'

// Components
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {InstallDependencies} from 'src/homepageExperience/components/steps/go/InstallDependencies'
import {InstallDependenciesSql} from 'src/homepageExperience/components/steps/go/InstallDependenciesSql'
import {Tokens} from 'src/homepageExperience/components/steps/Tokens'
import {InitializeClient} from 'src/homepageExperience/components/steps/go/InitializeClient'
import {WriteData} from 'src/homepageExperience/components/steps/go/WriteData'
import {WriteDataSql} from 'src/homepageExperience/components/steps/go/WriteDataSql'
import {ExecuteQuery} from 'src/homepageExperience/components/steps/go/ExecuteQuery'
import {ExecuteQuerySql} from 'src/homepageExperience/components/steps/go/ExecuteQuerySql'
import {ExecuteAggregateQuery} from 'src/homepageExperience/components/steps/go/ExecuteAggregateQuery'
import {Finish} from 'src/homepageExperience/components/steps/Finish'

import {WizardContainer} from 'src/homepageExperience/containers/WizardContainer'
import {GoIcon} from 'src/homepageExperience/components/HomepageIcons'

// Selectors
import {isOrgIOx} from 'src/organizations/selectors'

// Utils
import {
  HOMEPAGE_NAVIGATION_STEPS,
  HOMEPAGE_NAVIGATION_STEPS_GO_SQL,
} from 'src/homepageExperience/utils'

export const GoWizard: FC<{}> = () => {
  const [selectedBucket, setSelectedBucket] = useState<string>('my-bucket')
  const [finishStepCompleted, setFinishStepCompleted] = useState<boolean>(false)
  const [tokenValue, setTokenValue] = useState<string | null>(null)
  const [finalFeedback, setFinalFeedback] = useState<number | null>(null)

  const isIOxOrg = useSelector(isOrgIOx)
  const subwayNavSteps = isIOxOrg
    ? HOMEPAGE_NAVIGATION_STEPS_GO_SQL
    : HOMEPAGE_NAVIGATION_STEPS

  const handleMarkStepAsCompleted = () => {
    setFinishStepCompleted(true)
  }

  const renderSqlStep = currentStep => {
    switch (currentStep) {
      case 1: {
        return <Overview wizard="goWizard" />
      }
      case 2: {
        return <InstallDependenciesSql />
      }
      case 3: {
        return (
          <Tokens
            wizardEventName="goWizard"
            setTokenValue={setTokenValue}
            tokenValue={tokenValue}
          />
        )
      }
      case 4: {
        return <WriteDataSql onSelectBucket={setSelectedBucket} />
      }
      case 5: {
        return <ExecuteQuerySql />
      }
      case 6: {
        return (
          <Finish
            wizardEventName="goWizard"
            markStepAsCompleted={handleMarkStepAsCompleted}
            finishStepCompleted={finishStepCompleted}
            finalFeedback={finalFeedback}
            setFinalFeedback={setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="goWizard" />
      }
    }
  }

  const renderFluxStep = currentStep => {
    switch (currentStep) {
      case 1: {
        return <Overview wizard="goWizard" />
      }
      case 2: {
        return <InstallDependencies />
      }
      case 3: {
        return (
          <Tokens
            wizardEventName="goWizard"
            setTokenValue={setTokenValue}
            tokenValue={tokenValue}
          />
        )
      }
      case 4: {
        return <InitializeClient />
      }
      case 5: {
        return <WriteData onSelectBucket={setSelectedBucket} />
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
            wizardEventName="goWizard"
            markStepAsCompleted={handleMarkStepAsCompleted}
            finishStepCompleted={finishStepCompleted}
            finalFeedback={finalFeedback}
            setFinalFeedback={setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="goWizard" />
      }
    }
  }

  return (
    <WizardContainer
      icon={GoIcon}
      subwayNavSteps={subwayNavSteps}
      language="go"
      languageTitle="Go"
    >
      {currentStep => (
        <WriteDataDetailsContextProvider>
          {isIOxOrg ? renderSqlStep(currentStep) : renderFluxStep(currentStep)}
        </WriteDataDetailsContextProvider>
      )}
    </WizardContainer>
  )
}
