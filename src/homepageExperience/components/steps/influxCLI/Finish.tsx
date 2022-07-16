import React, {useEffect} from 'react'
import {
  AlignItems,
  ComponentSize,
  FlexBox,
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

const handleNextStepEvent = (nextStepName: string) => {
  event(`firstMile.influxCLI.nextSteps.${nextStepName}.clicked`)
}

export const Finish = (props: OwnProps) => {
  useEffect(() => {
    // if the finish step was opened during the session,
    // this check prevents from multiple logging of finish events
    // in case user navigates back and forth
    if (!props.finishStepCompleted) {
      event(`firstMile.influxCLI.finished`)
      props.markStepAsCompleted()
      fireConfetti()
    }
  }, [])

  return (
    <>
      <h1>Congrats!</h1>
      <p>You completed setting up, writing, and querying data.</p>
      <FeedbackBar
        wizardEventName="influxCLI"
        selectedFeedback={props.finalFeedback}
        onFeedbackSelection={props.setFinalFeedback}
      />
      <p style={{marginTop: '80px'}}>
        Curious to learn more? Try these next steps!
      </p>
      <FlexBox margin={ComponentSize.Medium} alignItems={AlignItems.Stretch}>
        <ResourceCard
          className="homepage-wizard-next-steps"
          onClick={() =>
            handleNextStepEvent('keyConcepts')
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
            handleNextStepEvent('cliCommands')
          }
        >
          <SafeBlankLink href="https://docs.influxdata.com/influxdb/cloud/reference/cli/influx/">
            <h4>{BookIcon}CLI Commands</h4>
          </SafeBlankLink>
          <p>
            See the full list of CLI commands and how to use them.
          </p>
        </ResourceCard>
        <ResourceCard
          className="homepage-wizard-next-steps"
          onClick={() =>
            handleNextStepEvent('influxUniversity')
          }
        >
          <SafeBlankLink href="https://influxdbu.com/">
            <h4>{CodeTerminalIcon}InfluxDB University</h4>
          </SafeBlankLink>
          <p>
            Our free hands-on courses teach you the technical skills and best
            practices to get the most out of your real-time data with InfluxDB.
          </p>
        </ResourceCard>
      </FlexBox>
    </>
  )
}
