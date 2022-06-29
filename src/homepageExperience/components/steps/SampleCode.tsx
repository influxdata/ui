import React, {FC} from 'react'

import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  ResourceCard,
} from '@influxdata/clockface'

import {SafeBlankLink} from 'src/utils/SafeBlankLink'

import {CodeTerminalIcon} from 'src/homepageExperience/components/HomepageIcons'

type Props = {
  wizardEventName: string
  handleNextStepEvent: (wizardEventName: string, nextStepName: string) => void
}

const SampleCode: FC<Props> = ({wizardEventName, handleNextStepEvent}) => {
  const resources = [
    {
      title: 'Sample App',
      textContent: `View an IoT sample application written in ${
        wizardEventName === 'pythonWizard' ? 'Python' : 'Node.js'
      }.`,
      links: {
        pythonWizard: 'https://github.com/influxdata/iot-api-python',
        nodejsWizard: 'https://github.com/influxdata/iot-api-js',
      },
    },
    {
      title: 'Boilerplate Snippets',
      textContent:
        'Get started writing and querying your own data using our code snippets.',
      links: {
        pythonWizard:
          'https://github.com/InfluxCommunity/sample-flask/blob/main/app.py',
        nodejsWizard: 'https://github.com/influxdata/nodejs-samples/',
      },
    },
  ]

  return (
    <FlexBox
      margin={ComponentSize.Large}
      alignItems={AlignItems.Stretch}
      direction={FlexDirection.Row}
    >
      {resources.map(app => (
        <ResourceCard
          className="homepage-wizard-next-steps"
          onClick={() => handleNextStepEvent(wizardEventName, app.title)}
          key={app.links[wizardEventName]}
        >
          <SafeBlankLink href={app.links[wizardEventName]}>
            <h4>
              {CodeTerminalIcon}
              {app.title}
            </h4>
          </SafeBlankLink>

          <p>{app.textContent}</p>
        </ResourceCard>
      ))}
    </FlexBox>
  )
}

export default SampleCode
