import React from 'react'
import {screen, waitFor} from '@testing-library/react'

import {renderWithRedux} from 'src/mockState'
import {FormattedDateTime} from 'src/utils/datetime/FormattedDateTime'

import {setTimeZone} from 'src/shared/actions/app'

import {DEFAULT_TIME_FORMAT} from 'src/utils/datetime/constants'

const timestamp = 426196800000 // july 4th, 1983

describe('the FormattedDateTime component', () => {
  describe("being aware of the user's preferred timezone", () => {
    it('formats dates in UTC times', () => {
      renderWithRedux(
        <FormattedDateTime
          format={DEFAULT_TIME_FORMAT}
          date={new Date(timestamp)}
        />,
        state => {
          return {
            ...state,
            app: {
              persisted: {
                timeZone: 'UTC',
              },
            },
          }
        }
      )
      screen.getByText('1983-07-04 20:00:00')
    })

    it.skip('formats dates in local times and will handle state changes (spec will only work in local tests, not in ci)', async () => {
      const {store} = renderWithRedux(
        <FormattedDateTime
          format={DEFAULT_TIME_FORMAT}
          date={new Date(timestamp)}
        />,
        state => {
          return {
            ...state,
            app: {
              persisted: {
                timeZone: 'America/Los_Angeles',
              },
            },
          }
        }
      )
      screen.getByText('1983-07-04 13:00:00')
      await store.dispatch(setTimeZone('UTC'))

      await waitFor(() => {
        screen.getByText('1983-07-04 20:00:00')
      })
    })
  })
})
