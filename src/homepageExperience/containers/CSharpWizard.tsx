// Libraries
import React, {FC, useState} from 'react'
import {useSelector} from 'react-redux'

// Contexts
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'

// Components
import {CSharpIcon} from 'src/homepageExperience/components/HomepageIcons'
import {ExecuteAggregateQuery} from '../components/steps/csharp/ExecuteAggregateQuery'
import {ExecuteQuery} from '../components/steps/csharp/ExecuteQuery'
import {ExecuteQuerySql} from 'src/homepageExperience/components/steps/csharp/ExecuteQuerySql'
import {Finish} from 'src/homepageExperience/components/steps/Finish'
import {InitializeClient} from '../components/steps/csharp/InitializeClient'
import {InitializeClientSql} from 'src/homepageExperience/components/steps/csharp/InitializeClientSql'
import {InstallDependencies} from '../components/steps/csharp/InstallDependencies'
import {InstallDependenciesSql} from 'src/homepageExperience/components/steps/csharp/InstallDependenciesSql'
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {Tokens} from 'src/homepageExperience/components/steps/Tokens'
import {WizardContainer} from 'src/homepageExperience/containers/WizardContainer'
import {WriteData} from '../components/steps/csharp/WriteData'
import {WriteDataSql} from 'src/homepageExperience/components/steps/csharp/WriteDataSql'

// Utils
import {isOrgIOx} from 'src/organizations/selectors'
import {
  HOMEPAGE_NAVIGATION_STEPS,
  HOMEPAGE_NAVIGATION_STEPS_SQL,
} from 'src/homepageExperience/utils'

export const CSharpWizard: FC<{}> = () => {
  const [selectedBucket, setSelectedBucket] = useState<string>('sample-bucket')
  const [finishStepCompleted, setFinishStepCompleted] = useState<boolean>(false)
  const [tokenValue, setTokenValue] = useState<string | null>(null)
  const [finalFeedback, setFinalFeedback] = useState<number | null>(null)

  const isIOxOrg = useSelector(isOrgIOx)
  const subwayNavSteps = isIOxOrg
    ? HOMEPAGE_NAVIGATION_STEPS_SQL
    : HOMEPAGE_NAVIGATION_STEPS

  const handleMarkStepAsCompleted = () => {
    setFinishStepCompleted(true)
  }

  const renderSqlStep = (currentStep: number) => {
    switch (currentStep) {
      case 1: {
        return <Overview wizard="csharpWizard" />
      }
      case 2: {
        return <InstallDependenciesSql />
      }
      case 3: {
        return (
          <Tokens
            wizardEventName="csharpWizard"
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
        return (
          <Finish
            wizardEventName="csharpWizard"
            markStepAsCompleted={handleMarkStepAsCompleted}
            finishStepCompleted={finishStepCompleted}
            finalFeedback={finalFeedback}
            setFinalFeedback={setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="csharpWizard" />
      }
    }
  }

  const renderFluxStep = (currentStep: number) => {
    switch (currentStep) {
      case 1: {
        return <Overview wizard="csharpWizard" />
      }
      case 2: {
        return <InstallDependencies />
      }
      case 3: {
        return (
          <Tokens
            wizardEventName="csharpWizard"
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
            wizardEventName="csharpWizard"
            markStepAsCompleted={handleMarkStepAsCompleted}
            finishStepCompleted={finishStepCompleted}
            finalFeedback={finalFeedback}
            setFinalFeedback={setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="csharpWizard" />
      }
    }
  }

  return (
    <WriteDataDetailsContextProvider>
      <WizardContainer
        icon={CSharpIcon}
        subwayNavSteps={subwayNavSteps}
        language="csharp"
        languageTitle="C#"
      >
        {currentStep =>
          isIOxOrg ? renderSqlStep(currentStep) : renderFluxStep(currentStep)
        }
      </WizardContainer>
    </WriteDataDetailsContextProvider>
  )
}
