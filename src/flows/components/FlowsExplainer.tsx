// Libraries
import React, {FC} from 'react'

// Components
import {
  Panel,
  Gradients,
  Button,
  ComponentColor,
  AlignItems,
  IconFont,
} from '@influxdata/clockface'
import {PROJECT_NAME_PLURAL, NOTEBOOKS_DOCUMENTATION_LINK} from 'src/flows'

const FlowsExplainer: FC = () => {
  const handleDocumentationClick = (): void => {
    window.open(NOTEBOOKS_DOCUMENTATION_LINK, '_blank')
  }

  return (
    <Panel gradient={Gradients.PolarExpress} border={true}>
      <Panel.Header>
        <h5>What are {PROJECT_NAME_PLURAL.toLowerCase()}?</h5>
      </Panel.Header>
      <Panel.Body alignItems={AlignItems.FlexStart}>
        <p>
          {PROJECT_NAME_PLURAL} are a tool to help you explore, visualize, and
          process your data. Learn how to downsample data and other handy
          tutorials:
        </p>
        <Button
          icon={IconFont.TextBlock}
          onClick={handleDocumentationClick}
          color={ComponentColor.Secondary}
          text="Notebooks Docs"
        />
      </Panel.Body>
    </Panel>
  )
}

export default FlowsExplainer
