// Libraries
import React, {FC, useState} from 'react'
import {useSelector} from 'react-redux'

// Contexts
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'

// Components
import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {InstallDependencies} from 'src/homepageExperience/components/steps/nodejs/InstallDependencies'
import {InstallDependenciesSql} from 'src/homepageExperience/components/steps/nodejs/InstallDependenciesSql'
import {Tokens} from 'src/homepageExperience/components/steps/Tokens'
import {InitializeClient} from 'src/homepageExperience/components/steps/nodejs/InitializeClient'
import {InitializeClientSql} from 'src/homepageExperience/components/steps/nodejs/InitializeClientSql'
import {WriteData} from 'src/homepageExperience/components/steps/nodejs/WriteData'
import {WriteDataSql} from 'src/homepageExperience/components/steps/nodejs/WriteDataSql'
import {ExecuteQuery} from 'src/homepageExperience/components/steps/nodejs/ExecuteQuery'
import {ExecuteQuerySql} from 'src/homepageExperience/components/steps/nodejs/ExecuteQuerySql'
import {ExecuteAggregateQuery} from 'src/homepageExperience/components/steps/nodejs/ExecuteAggregateQuery'
import {Finish} from 'src/homepageExperience/components/steps/Finish'

import {WizardContainer} from 'src/homepageExperience/containers/WizardContainer'
import {NodejsIcon} from 'src/homepageExperience/components/HomepageIcons'

// Selectors
import {isOrgIOx} from 'src/organizations/selectors'

// Utils
import {
  HOMEPAGE_NAVIGATION_STEPS,
  HOMEPAGE_NAVIGATION_STEPS_SQL,
} from 'src/homepageExperience/utils'

export const NodejsWizard: FC<{}> = () => {
  const [selectedBucket, setSelectedBucket] = useState<string>('my-bucket')
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

  const renderSqlStep = currentStep => {
    switch (currentStep) {
      case 1: {
        return <Overview wizard="nodejsWizard" />
      }
      case 2: {
        return <InstallDependenciesSql />
      }
      case 3: {
        return (
          <Tokens
            wizardEventName="nodejsWizard"
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
            wizardEventName="nodejsWizard"
            markStepAsCompleted={handleMarkStepAsCompleted}
            finishStepCompleted={finishStepCompleted}
            finalFeedback={finalFeedback}
            setFinalFeedback={setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="nodejsWizard" />
      }
    }
  }

  const renderFluxStep = currentStep => {
    switch (currentStep) {
      case 1: {
        return <Overview wizard="nodejsWizard" />
      }
      case 2: {
        return <InstallDependencies />
      }
      case 3: {
        return (
          <Tokens
            wizardEventName="nodejsWizard"
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
            wizardEventName="nodejsWizard"
            markStepAsCompleted={handleMarkStepAsCompleted}
            finishStepCompleted={finishStepCompleted}
            finalFeedback={finalFeedback}
            setFinalFeedback={setFinalFeedback}
          />
        )
      }
      default: {
        return <Overview wizard="nodejsWizard" />
      }
    }
  }

  return (
    <WriteDataDetailsContextProvider>
      <WizardContainer
        icon={NodejsIcon}
        subwayNavSteps={subwayNavSteps}
        language="nodejs"
        languageTitle="Node.js"
      >
        {isIOxOrg
          ? currentStep => renderSqlStep(currentStep)
          : currentStep => renderFluxStep(currentStep)}
      </WizardContainer>
    </WriteDataDetailsContextProvider>
  )
}
