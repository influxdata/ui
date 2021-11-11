import React from 'react'
import {renderWithRedux} from 'src/mockState'
import BucketCardMeta from './BucketCardMeta'
import {OwnBucket} from '../../types'
import {SchemaType} from '../../client'

const setup = (
  schemaType: SchemaType,
  type: 'user' | 'system' = 'system',
  id: string
) => {
  const bucket: OwnBucket = {
    id,
    type,
    schemaType,
    readableRetention: '30 days',
    name: 'testBucket',
    retentionRules: [],
    labels: [],
  }
  return renderWithRedux(<BucketCardMeta bucket={bucket} />)
}

jest.mock('src/shared/constants/index', () => ({
  CLOUD: true,
}))

const EXPLICIT_TEXT = 'Schema Type: Explicit'
const IMPLICIT_TEXT = 'Schema Type: Implicit'

describe('bucket meta data card, testing that the schema type shows up properly', () => {
  it('should show the explicit schema type', () => {
    const {getByTestId} = setup('explicit', 'user', 'fooabc')

    const card = getByTestId('resourceCard-buckets-fooabc')

    const schemaType = getByTestId('bucket-schemaType')
    // should be three nodes ( '30 days', <id string>. and 'explicit schema type')

    expect(card.childElementCount).toEqual(3)

    expect(schemaType).toHaveTextContent(EXPLICIT_TEXT)
  })

  it('should show "implicit" if the schema  is not there, with a user bucket', () => {
    const {getByTestId} = setup(null, 'user', 'fooabc')

    const card = getByTestId('resourceCard-buckets-fooabc')

    // should be three nodes ('30 days', "id string....", and 'implicit schema type')
    expect(card.childElementCount).toEqual(3)

    expect(getByTestId('bucket-schemaType')).toHaveTextContent(IMPLICIT_TEXT)
  })

  it('should show the implicit schema type', () => {
    const {getByTestId} = setup('implicit', 'system', 'fooabc')

    const card = getByTestId('resourceCard-buckets-fooabc')

    const schemaType = getByTestId('bucket-schemaType')
    // should be three nodes ('system', '30 days', and 'implicit schema type', <id string>)

    expect(card.childElementCount).toEqual(4)

    expect(schemaType).toHaveTextContent(IMPLICIT_TEXT)
  })

  it('should show "implicit" if the schema  is not there, with a system bucket', () => {
    const {getByTestId} = setup(null, 'system', 'fooabc')

    const card = getByTestId('resourceCard-buckets-fooabc')

    // should be three nodes ('system', '30 days', 'implicit schema type', <id string>)
    expect(card.childElementCount).toEqual(4)

    expect(getByTestId('bucket-schemaType')).toHaveTextContent(IMPLICIT_TEXT)
  })
})
