import React, {useEffect} from 'react'
import {useSelector} from 'react-redux'
import confetti from 'canvas-confetti'

// Components
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  ResourceCard,
} from '@influxdata/clockface'
import {
  BookIcon,
  CodeTerminalIcon,
} from 'src/homepageExperience/components/HomepageIcons'
import FeedbackBar from 'src/homepageExperience/components/FeedbackBar'
import SampleAppCard from 'src/homepageExperience/components/steps/SampleAppCard'
import DashboardIntegrations from 'src/homepageExperience/components/steps/DashboardIntegrations'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {isOrgIOx} from 'src/organizations/selectors'

type OwnProps = {
  wizardEventName: string
  markStepAsCompleted: () => void
  finishStepCompleted: boolean
  finalFeedback: number
  setFinalFeedback: (feedbackValue: number) => void
}

const fireConfetti = () => {
  const count = 200
  const defaults = {
    origin: {y: 0.7},
  }

  const fire = (particleRatio, options) => {
    confetti({
      ...defaults,
      ...options,
      particleCount: Math.floor(count * particleRatio),
    })
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  })
  fire(0.2, {
    spread: 60,
  })
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  })
}

const handleNextStepEvent = (wizardEventName: string, nextStepName: string) => {
  event(`firstMile.${wizardEventName}.nextSteps.${nextStepName}.clicked`)
}

const marginTopStyle = {marginTop: '80px'}

export const Finish = (props: OwnProps) => {
  const {
    finalFeedback,
    finishStepCompleted,
    markStepAsCompleted,
    setFinalFeedback,
    wizardEventName,
  } = props

  useEffect(() => {
    // if the finish step was opened during the session,
    // this check prevents from multiple logging of finish events
    // in case user navigates back and forth
    if (!finishStepCompleted) {
      event(`firstMile.${wizardEventName}.finished`)
      markStepAsCompleted()
      fireConfetti()
    }
  }, [finishStepCompleted, markStepAsCompleted, wizardEventName])

  const writeOnly =
    useSelector(isOrgIOx) &&
    (wizardEventName === 'arduinoWizard' || wizardEventName === 'nodejsWizard')

  const outroContent = writeOnly
    ? `You completed setting up and writing data.`
    : `You completed setting up, writing, and querying data.`

  return (
    <>
      <h1>Congrats!</h1>
      <p>{outroContent}</p>
      <FeedbackBar
        wizardEventName={wizardEventName}
        selectedFeedback={finalFeedback}
        onFeedbackSelection={setFinalFeedback}
      />
      <p style={marginTopStyle}>Curious to learn more? Try these next steps!</p>
      <FlexBox
        margin={ComponentSize.Large}
        direction={FlexDirection.Column}
        alignItems={AlignItems.FlexStart}
      >
        <FlexBox
          margin={ComponentSize.Large}
          alignItems={AlignItems.Stretch}
          direction={FlexDirection.Row}
        >
          <ResourceCard className="homepage-wizard-next-steps">
            <SafeBlankLink
              href="https://docs.influxdata.com/influxdb/latest/reference/key-concepts/"
              onClick={() =>
                handleNextStepEvent(wizardEventName, 'keyConcepts')
              }
            >
              <h4>{BookIcon}Key Concepts</h4>
            </SafeBlankLink>
            <p>Learn about important concepts for writing time-series data.</p>
          </ResourceCard>
          {!isFlagEnabled('ioxOnboarding') && (
            <ResourceCard className="homepage-wizard-next-steps">
              <SafeBlankLink
                href="https://university.influxdata.com/"
                onClick={() =>
                  handleNextStepEvent(wizardEventName, 'influxUniversity')
                }
              >
                <h4>{CodeTerminalIcon}InfluxDB University</h4>
              </SafeBlankLink>
              <p>
                Our free hands-on courses teach you the technical skills and
                best practices to get the most out of your real-time data with
                InfluxDB.
              </p>
            </ResourceCard>
          )}
          {props.wizardEventName === 'cliWizard' && (
            <ResourceCard className="homepage-wizard-next-steps">
              <SafeBlankLink
                href="https://docs.influxdata.com/influxdb/cloud/reference/cli/influx/"
                onClick={() =>
                  handleNextStepEvent(props.wizardEventName, 'cliCommands')
                }
              >
                <h4>{BookIcon}CLI Commands</h4>
              </SafeBlankLink>
              <p>See the full list of CLI commands and how to use them.</p>
            </ResourceCard>
          )}
        </FlexBox>
        {props.wizardEventName !== 'cliWizard' &&
        props.wizardEventName !== 'arduinoWizard' &&
        !isFlagEnabled('ioxOnboarding') ? (
          <SampleAppCard
            handleNextStepEvent={handleNextStepEvent}
            wizardEventName={props.wizardEventName}
          />
        ) : null}
        {isFlagEnabled('ioxOnboarding') && (
          <DashboardIntegrations
            handleNextStepEvent={handleNextStepEvent}
            wizardEventName={props.wizardEventName}
          />
        )}
      </FlexBox>
    </>
  )
}
