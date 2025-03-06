// Libraries
import React, {FC, useState} from 'react'
import {useSelector} from 'react-redux'

// Contexts
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'

// Components
import {ExecuteAggregateQuery} from 'src/homepageExperience/components/steps/python/ExecuteAggregateQuery'
import {ExecuteAggregateQuerySql} from 'src/homepageExperience/components/steps/python/ExecuteAggregateQuerySql'
import {ExecuteQuery} from 'src/homepageExperience/components/steps/python/ExecuteQuery'
import {ExecuteQuerySql} from 'src/homepageExperience/components/steps/python/ExecuteQuerySql'
import {Finish} from 'src/homepageExperience/components/steps/Finish'
import {InitializeClient} from 'src/homepageExperience/components/steps/python/InitializeClient'
import {InitializeClientSql} from 'src/homepageExperience/components/steps/python/InitializeClientSql'
import {InstallDependencies} from 'src/homepageExperience/components/steps/python/InstallDependencies'
import {InstallDependenciesSql} from 'src/homepageExperience/components/steps/python/InstallDependenciesSql'
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {PythonIcon} from 'src/homepageExperience/components/HomepageIcons'
import {Tokens} from 'src/homepageExperience/components/steps/Tokens'
import {WizardContainer} from 'src/homepageExperience/containers/WizardContainer'
import {WriteData} from 'src/homepageExperience/components/steps/python/WriteData'
import {WriteDataSql} from 'src/homepageExperience/components/steps/python/WriteDataSql'

// Utils
import {isOrgIOx} from 'src/organizations/selectors'
import {HOMEPAGE_NAVIGATION_STEPS} from 'src/homepageExperience/utils'

export const PythonWizard: FC<{}> = () => {
  const [selectedBucket, setSelectedBucket] = useState<string>('sample-bucket')
  const [finishStepCompleted, setFinishStepCompleted] = useState<boolean>(false)
  const [tokenValue, setTokenValue] = useState<string | null>(null)
  const [finalFeedback, setFinalFeedback] = useState<number | null>(null)

  const isIOxOrg = useSelector(isOrgIOx)
  const subwayNavSteps = HOMEPAGE_NAVIGATION_STEPS

  const handleMarkStepAsCompleted = () => {
    setFinishStepCompleted(true)
  }

  const renderSqlStep = (currentStep: number) => {
    switch (currentStep) {
      case 1: {
        return <Overview wizard="pythonWizard" />
      }
      case 2: {
        return <InstallDependenciesSql />
      }
      case 3: {
        return (
          <Tokens
            wizardEventName="pythonWizard"
            setTokenValue={setTokenValue}
            tokenValue={tokenValue}
          />
        )
      }
      case 4: {
        return <InitializeClientSql />
      }
      case 5: {
        return <WriteDataSql onSelectBucket={setSelectedBucket} />
      }
      case 6: {
        return <ExecuteQuerySql bucket={selectedBucket} />
      }
      case 7: {
        return <ExecuteAggregateQuerySql bucket={selectedBucket} />
      }
      case 8: {
        return (
          <Finish
            wizardEventName="pythonWizard"
            markStepAsCompleted={handleMarkStepAsCompleted}
            finishStepCompleted={finishStepCompleted}
            finalFeedback={finalFeedback}
            setFinalFeedback={setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="pythonWizard" />
      }
    }
  }

  const renderFluxStep = (currentStep: number) => {
    switch (currentStep) {
      case 1: {
        return <Overview wizard="pythonWizard" />
      }
      case 2: {
        return <InstallDependencies />
      }
      case 3: {
        return (
          <Tokens
            wizardEventName="pythonWizard"
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
            wizardEventName="pythonWizard"
            markStepAsCompleted={handleMarkStepAsCompleted}
            finishStepCompleted={finishStepCompleted}
            finalFeedback={finalFeedback}
            setFinalFeedback={setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="pythonWizard" />
      }
    }
  }

  return (
    <WriteDataDetailsContextProvider>
      <WizardContainer
        icon={PythonIcon}
        subwayNavSteps={subwayNavSteps}
        language="python"
        languageTitle="Python"
      >
        {currentStep =>
          isIOxOrg ? renderSqlStep(currentStep) : renderFluxStep(currentStep)
        }
      </WizardContainer>
    </WriteDataDetailsContextProvider>
  )
}
