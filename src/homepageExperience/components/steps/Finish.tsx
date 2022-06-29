import React, {useEffect} from 'react'
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  ResourceCard,
} from '@influxdata/clockface'

import confetti from 'canvas-confetti'

import {
  BookIcon,
  CodeTerminalIcon,
} from 'src/homepageExperience/components/HomepageIcons'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

import {event} from 'src/cloud/utils/reporting'
import FeedbackBar from 'src/homepageExperience/components/FeedbackBar'

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

export const Finish = (props: OwnProps) => {
  useEffect(() => {
    // if the finish step was opened during the session,
    // this check prevents from multiple logging of finish events
    // in case user navigates back and forth
    if (!props.finishStepCompleted) {
      event(`firstMile.${props.wizardEventName}.finished`)
      props.markStepAsCompleted()
      fireConfetti()
    }
  }, [])

  const showSampleApp =
    props.wizardEventName === 'pythonWizard' ||
    props.wizardEventName === 'nodejsWizard'
  const sampleAppLink =
    props.wizardEventName === 'pythonWizard'
      ? 'https://github.com/influxdata/iot-api-python'
      : 'https://github.com/influxdata/iot-api-js'
  const showBoilerplate = props.wizardEventName === 'nodejsWizard'

  return (
    <>
      <h1>Congrats!</h1>
      <p>You completed setting up, writing, and querying data.</p>
      <FeedbackBar
        wizardEventName={props.wizardEventName}
        selectedFeedback={props.finalFeedback}
        onFeedbackSelection={props.setFinalFeedback}
      />
      <p style={{marginTop: '80px'}}>
        Curious to learn more? Try these next steps!
      </p>
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
          <ResourceCard
            className="homepage-wizard-next-steps"
            onClick={() =>
              handleNextStepEvent(props.wizardEventName, 'keyConcepts')
            }
          >
            <SafeBlankLink href="https://docs.influxdata.com/influxdb/v2.2/reference/key-concepts/">
              <h4>{BookIcon}Key Concepts</h4>
            </SafeBlankLink>
            <p>Learn about important concepts for writing time-series data.</p>
          </ResourceCard>
          <ResourceCard
            className="homepage-wizard-next-steps"
            onClick={() =>
              handleNextStepEvent(props.wizardEventName, 'influxUniversity')
            }
          >
            <SafeBlankLink href="https://influxdbu.com/">
              <h4>{CodeTerminalIcon}InfluxDB University</h4>
            </SafeBlankLink>
            <p>
              Our free hands-on courses teach you the technical skills and best
              practices to get the most out of your real-time data with
              InfluxDB.
            </p>
          </ResourceCard>
        </FlexBox>
        <FlexBox
          margin={ComponentSize.Large}
          alignItems={AlignItems.Stretch}
          direction={FlexDirection.Row}
        >
          {showSampleApp && (
            <ResourceCard
              className="homepage-wizard-next-steps"
              onClick={() =>
                handleNextStepEvent(props.wizardEventName, 'sampleApp')
              }
            >
              <SafeBlankLink href={sampleAppLink}>
                <h4>{CodeTerminalIcon}Sample App</h4>
              </SafeBlankLink>
              {props.wizardEventName === 'pythonWizard' ? (
                <p>
                  Play around with our template code of sample app to streamline
                  your own data into InfluxData.
                </p>
              ) : (
                // nodejs sample app
                <p>View an IoT sample application written in Node.js.</p>
              )}
            </ResourceCard>
          )}
          {showBoilerplate && (
            <ResourceCard
              className="homepage-wizard-next-steps"
              onClick={() =>
                handleNextStepEvent(props.wizardEventName, 'Boilerplate')
              }
            >
              <SafeBlankLink href="https://github.com/influxdata/nodejs-samples/">
                <h4>{CodeTerminalIcon}Boilerplate Snippets</h4>
              </SafeBlankLink>

              <p>
                Get started writing and querying your own data using our code
                snippets.
              </p>
            </ResourceCard>
          )}
        </FlexBox>
      </FlexBox>
    </>
  )
}
