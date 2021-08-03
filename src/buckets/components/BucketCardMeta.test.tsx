import React from 'react'
import {renderWithRedux} from 'src/mockState'
import BucketCardMeta from 'src/buckets/components/BucketCardMeta'
import {OwnBucket} from '../../types'
import {SchemaType} from '../../client'

// setting 'now' as the first of march, 2021 at 11 am.
// the clocks changed on march 14, btw
const now = new Date('2021-03-01 11:00 am').getTime()

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

describe(
  'bucket meta data card, ' +
    'testing that the schema type shows up (or disappears) properly',
  () => {
    it('should show the explicit schema type', () => {
      const {getByTestId} = setup('explicit', 'user', 'fooabc')

      const card = getByTestId('resourceCard-buckets-fooabc')

      const schemaType = getByTestId('bucket-schemaType')
      // should be three nodes ( '30 days', <id string>. and 'implicit schema type')

     expect(card.childElementCount).toEqual(3)

      expect(schemaType).toHaveTextContent('Explicit Schema Type')
    })

    it('should not show the schema if it is not there', () => {
      const {queryByTestId, getByTestId} = setup(null, 'user', 'fooabc')

      const card = getByTestId('resourceCard-buckets-fooabc')

      // should be two nodes ('30 days', "id string....")
      expect(card.childElementCount).toEqual(2)

      expect(queryByTestId('bucket-schemaType')).toBeNull()
    })

    it('should show the implicit schema type', () => {
      const {getByTestId} = setup('implicit', 'system', 'fooabc')

      const card = getByTestId('resourceCard-buckets-fooabc')

      const schemaType = getByTestId('bucket-schemaType')
      // should be three nodes ('system', '30 days', and 'implicit schema type')

      expect(card.childElementCount).toEqual(3)

      expect(schemaType).toHaveTextContent('Implicit Schema Type')
    })

    it('should not show the schema if it is not there', () => {
      const {queryByTestId, getByTestId} = setup(null, 'system', 'fooabc')

      const card = getByTestId('resourceCard-buckets-fooabc')

      // should be three nodes ('system', '30 days')
      expect(card.childElementCount).toEqual(2)

      expect(queryByTestId('bucket-schemaType')).toBeNull()
    })
  }
)
