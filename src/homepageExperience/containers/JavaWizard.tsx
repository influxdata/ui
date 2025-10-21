// Libraries
import React, {FC, useState} from 'react'
import {useSelector} from 'react-redux'

// Contexts
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'

// Components
import {ExecuteAggregateQuery} from 'src/homepageExperience/components/steps/java/ExecuteAggregateQuery'
import {ExecuteQuery} from 'src/homepageExperience/components/steps/java/ExecuteQuery'
import {ExecuteQuerySql} from 'src/homepageExperience/components/steps/java/ExecuteQuerySql'
import {Finish} from 'src/homepageExperience/components/steps/Finish'
import {InitializeClient} from 'src/homepageExperience/components/steps/java/InitializeClient'
import {InitializeClientSql} from 'src/homepageExperience/components/steps/java/InitializeClientSql'
import {InstallDependencies} from 'src/homepageExperience/components/steps/java/InstallDependencies'
import {InstallDependenciesSql} from 'src/homepageExperience/components/steps/java/InstallDependenciesSql'
import {JavaIcon} from 'src/homepageExperience/components/HomepageIcons'
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {Tokens} from 'src/homepageExperience/components/steps/Tokens'
import {WizardContainer} from 'src/homepageExperience/containers/WizardContainer'
import {WriteData} from 'src/homepageExperience/components/steps/java/WriteData'
import {WriteDataSql} from 'src/homepageExperience/components/steps/java/WriteDataSql'

// Utils
import {isOrgIOx, getOrg} from 'src/organizations/selectors'
import {
  HOMEPAGE_NAVIGATION_STEPS,
  HOMEPAGE_NAVIGATION_STEPS_SQL,
} from 'src/homepageExperience/utils'

export const JavaWizard: FC<{}> = () => {
  const [selectedBucket, setSelectedBucket] = useState<string>('sample-bucket')
  const [finishStepCompleted, setFinishStepCompleted] = useState<boolean>(false)
  const [tokenValue, setTokenValue] = useState<string | null>(null)
  const [finalFeedback, setFinalFeedback] = useState<number | null>(null)

  const org = useSelector(getOrg)
  const isIOxOrg = useSelector(isOrgIOx)
  // TSM (Legacy, GCP, Azure) should use the v2 client (influxdb-client-java)
  // Only show v3 client (influxdb3-java) for IOx with explicit 'iox' storage type
  const shouldUseV3Client = isIOxOrg && org?.defaultStorageType?.toLowerCase() === 'iox'
  const subwayNavSteps = shouldUseV3Client
    ? HOMEPAGE_NAVIGATION_STEPS_SQL
    : HOMEPAGE_NAVIGATION_STEPS

  const handleMarkStepAsCompleted = () => {
    setFinishStepCompleted(true)
  }

  const renderSqlStep = (currentStep: number) => {
    switch (currentStep) {
      case 1: {
        return <Overview wizard="javaWizard" />
      }
      case 2: {
        return <InstallDependenciesSql />
      }
      case 3: {
        return (
          <Tokens
            wizardEventName="javaWizard"
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
            wizardEventName="javaWizard"
            markStepAsCompleted={handleMarkStepAsCompleted}
            finishStepCompleted={finishStepCompleted}
            finalFeedback={finalFeedback}
            setFinalFeedback={setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="javaWizard" />
      }
    }
  }

  const renderFluxStep = (currentStep: number) => {
    switch (currentStep) {
      case 1: {
        return <Overview wizard="javaWizard" />
      }
      case 2: {
        return <InstallDependencies />
      }
      case 3: {
        return (
          <Tokens
            wizardEventName="javaWizard"
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
            wizardEventName="javaWizard"
            markStepAsCompleted={handleMarkStepAsCompleted}
            finishStepCompleted={finishStepCompleted}
            finalFeedback={finalFeedback}
            setFinalFeedback={setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="javaWizard" />
      }
    }
  }

  return (
    <WriteDataDetailsContextProvider>
      <WizardContainer
        icon={JavaIcon}
        subwayNavSteps={subwayNavSteps}
        language="java"
        languageTitle="Java"
      >
        {currentStep =>
          shouldUseV3Client ? renderSqlStep(currentStep) : renderFluxStep(currentStep)
        }
      </WizardContainer>
    </WriteDataDetailsContextProvider>
  )
}
