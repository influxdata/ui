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

// Constants
import {DOCS_URL_VERSION} from 'src/shared/constants/fluxFunctions'
import {DEFAULT_TOKEN_DESCRIPTION} from 'src/dashboards/constants'

// Utils
import {getAll} from 'src/resources/selectors'

// Types
import {AppState, ResourceType, Authorization} from 'src/types'

import GenerateTokenDropdown from 'src/authorizations/components/GenerateTokenDropdown'

import GenerateTokenDropdownRedesigned from 'src/authorizations/components/redesigned/GenerateTokenDropdown'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const WriteDataHelperTokens: FC = () => {
  const tokens = useSelector((state: AppState) =>
    getAll<Authorization>(state, ResourceType.Authorizations)
  )
  const {token, changeToken} = useContext(WriteDataDetailsContext)
  const tokensWithDescription = tokens.map(token => {
    return {
      ...token,
      description:
        token?.description?.length === 0
          ? DEFAULT_TOKEN_DESCRIPTION
          : token.description,
    }
  })

  let body = (
    <EmptyState
      className="write-data--details-empty-state"
      testID="write-data--details-empty-state"
    >
      <span>
        You don't have any{' '}
        <a
          href={`https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/security/tokens/`}
          target="_blank"
          rel="noreferrer"
        >
          API Tokens
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

  if (tokensWithDescription.length) {
    body = (
      <List
        backgroundColor={InfluxColors.Grey5}
        style={{height: '200px'}}
        maxHeight="200px"
        testID="write-data-tokens-list"
      >
        {tokensWithDescription.map(t => (
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
        {isFlagEnabled('tokensUIRedesign') ? (
          <GenerateTokenDropdownRedesigned />
        ) : (
          <GenerateTokenDropdown />
        )}
      </Heading>
      {body}
    </>
  )
}

export default WriteDataHelperTokens
