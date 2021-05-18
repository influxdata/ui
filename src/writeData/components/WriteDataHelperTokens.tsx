// Libraries
import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'

// Contexts
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'

// Components
import {
  List,
  ComponentSize,
  Heading,
  HeadingElement,
  Gradients,
  InfluxColors,
  EmptyState,
} from '@influxdata/clockface'

// Utils
import {getAll} from 'src/resources/selectors'

// Types
import {AppState, ResourceType, Authorization} from 'src/types'

import GenerateTokenDropdown from 'src/authorizations/components/GenerateTokenDropdown'

const WriteDataHelperTokens: FC = () => {
  const tokens = useSelector((state: AppState) =>
    getAll<Authorization>(state, ResourceType.Authorizations)
  )
  const {token, changeToken} = useContext(WriteDataDetailsContext)

  let body = (
    <EmptyState
      className="write-data--details-empty-state"
      testID="write-data--details-empty-state"
    >
      <span>
        You don't have any{' '}
        <a
          href="https://docs.influxdata.com/influxdb/cloud/security/tokens/"
          target="_blank"
          rel="noreferrer"
        >
          Tokens
        </a>
      </span>
    </EmptyState>
  )

  const isSelected = (tokenID: string): boolean => {
    if (!token) {
      return false
    }

    return tokenID === token.id
  }

  if (tokens.length) {
    body = (
      <List
        backgroundColor={InfluxColors.Obsidian}
        style={{height: '200px'}}
        maxHeight="200px"
        testID="write-data-tokens-list"
      >
        {tokens.map(t => (
          <List.Item
            size={ComponentSize.Small}
            key={t.id}
            testID={t.description}
            selected={isSelected(t.id)}
            value={t}
            onClick={changeToken}
            wrapText={true}
            gradient={Gradients.GundamPilot}
          >
            {t.description}
          </List.Item>
        ))}
      </List>
    )
  }

  return (
    <>
      <Heading
        element={HeadingElement.H6}
        className="write-data--details-widget-title"
      >
        Token
        <GenerateTokenDropdown />
      </Heading>
      {body}
    </>
  )
}

export default WriteDataHelperTokens
