// Libraries
import React, {FC, useState} from 'react'
import {useSelector} from 'react-redux'

// Contexts
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'

// Components
import {CLIIcon} from 'src/homepageExperience/components/HomepageIcons'
import {ExecuteAggregateQuery} from 'src/homepageExperience/components/steps/cli/ExecuteAggregateQuery'
import {ExecuteQuery} from 'src/homepageExperience/components/steps/cli/ExecuteQuery'
import {ExecuteQuerySql} from 'src/homepageExperience/components/steps/cli/ExecuteQuerySql'
import {Finish} from 'src/homepageExperience/components/steps/Finish'
import {InitializeClient} from 'src/homepageExperience/components/steps/cli/InitializeClient'
import {InstallDependencies} from 'src/homepageExperience/components/steps/cli/InstallDependencies'
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {WizardContainer} from 'src/homepageExperience/containers/WizardContainer'
import {WriteData} from 'src/homepageExperience/components/steps/cli/WriteData'

// Utils
import {isOrgIOx} from 'src/organizations/selectors'
import {
  HOMEPAGE_NAVIGATION_STEPS_SHORT,
  HOMEPAGE_NAVIGATION_STEPS_SHORT_SQL,
} from 'src/homepageExperience/utils'

export const CliWizard: FC<{}> = () => {
  const [selectedBucket, setSelectedBucket] = useState<string>('sample-bucket')
  const [finishStepCompleted, setFinishStepCompleted] = useState<boolean>(false)
  const [tokenValue, setTokenValue] = useState<string | null>(null)
  const [finalFeedback, setFinalFeedback] = useState<number | null>(null)

  const isIOxOrg = useSelector(isOrgIOx)
  const subwayNavSteps = isIOxOrg
    ? HOMEPAGE_NAVIGATION_STEPS_SHORT_SQL
    : HOMEPAGE_NAVIGATION_STEPS_SHORT

  const handleMarkStepAsCompleted = () => {
    setFinishStepCompleted(true)
  }

  const renderSqlStep = (currentStep: number) => {
    switch (currentStep) {
      case 1: {
        return <Overview wizard="cliWizard" />
      }
      case 2: {
        return <InstallDependencies />
      }
      case 3: {
        return (
          <InitializeClient
            setTokenValue={setTokenValue}
            tokenValue={tokenValue}
            onSelectBucket={setSelectedBucket}
          />
        )
      }
      case 4: {
        return <WriteData bucket={selectedBucket} />
      }
      case 5: {
        return <ExecuteQuerySql bucket={selectedBucket} />
      }
      case 6: {
        return (
          <Finish
            wizardEventName="cliWizard"
            markStepAsCompleted={handleMarkStepAsCompleted}
            finishStepCompleted={finishStepCompleted}
            finalFeedback={finalFeedback}
            setFinalFeedback={setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="cliWizard" />
      }
    }
  }

  const renderFluxStep = (currentStep: number) => {
    switch (currentStep) {
      case 1: {
        return <Overview wizard="cliWizard" />
      }
      case 2: {
        return <InstallDependencies />
      }
      case 3: {
        return (
          <InitializeClient
            setTokenValue={setTokenValue}
            tokenValue={tokenValue}
            onSelectBucket={setSelectedBucket}
          />
        )
      }
      case 4: {
        return <WriteData bucket={selectedBucket} />
      }
      case 5: {
        return <ExecuteQuery bucket={selectedBucket} />
      }
      case 6: {
        return <ExecuteAggregateQuery bucket={selectedBucket} />
      }
      case 7: {
        return (
          <Finish
            wizardEventName="cliWizard"
            markStepAsCompleted={handleMarkStepAsCompleted}
            finishStepCompleted={finishStepCompleted}
            finalFeedback={finalFeedback}
            setFinalFeedback={setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="cliWizard" />
      }
    }
  }

  return (
    <WriteDataDetailsContextProvider>
      <WizardContainer
        icon={CLIIcon}
        subwayNavSteps={subwayNavSteps}
        language="cli"
        languageTitle="CLI"
      >
        {currentStep =>
          isIOxOrg ? renderSqlStep(currentStep) : renderFluxStep(currentStep)
        }
      </WizardContainer>
    </WriteDataDetailsContextProvider>
  )
}
