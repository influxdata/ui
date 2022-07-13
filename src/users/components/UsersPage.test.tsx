import React from 'react'
import {fireEvent, waitFor} from '@testing-library/react'
import {mocked} from 'ts-jest/utils'
import {act} from 'react-dom/test-utils'

import {renderWithReduxAndRouter} from 'src/mockState'
import {UsersProvider} from '../context/users'
import UsersPage from './UsersPage'

jest.mock(
  'src/client/unityRoutes',
  () => ({
    getOrgsUsers: jest.fn(() =>
      Promise.resolve({
        status: 200,
        headers: {},
        data: [
          {
            id: '1',
            firstName: 'Test',
            lastName: 'User',
            email: 'initial+user@example.com',
            role: 'owner',
          },
        ],
      })
    ),
    getOrgsInvites: jest.fn(() =>
      Promise.resolve({
        status: 200,
        headers: {},
        data: [
          {
            id: 789,
            email: 'initial+invite@example.com',
            role: 'owner',
            expiresAt: '2022-07-16T19:01:24.841104Z',
          },
        ],
      })
    ),
    postOrgsInvite: jest.fn(),
  }),
  {virtual: true}
)

import {postOrgsInvite} from 'src/client/unityRoutes'

const setup = () => {
  return renderWithReduxAndRouter(
    <>
      <UsersProvider>
        <UsersPage />
      </UsersProvider>
    </>
  )
}

describe('Inviting Users to an Organization', () => {
  it('renders existing users', async () => {
    const {getByTestId} = setup()

    await waitFor(() => {
      const userListItem = getByTestId(
        'user-list-item initial+user@example.com'
      )

      expect(userListItem).toHaveTextContent('Active')
    })
  })

  it('renders existing invites', async () => {
    const {getByTestId} = setup()

    await waitFor(() => {
      const inviteListItem = getByTestId(
        'invite-list-item initial+invite@example.com'
      )
      expect(inviteListItem).toHaveTextContent('Invite expiration 7/16/2022')
    })
  })

  it('adds a user who belongs to an account to the organization', async () => {
    const {getByTestId} = setup()

    const newUserEmail = 'new+user@example.com'

    mocked(postOrgsInvite).mockImplementation(() =>
      Promise.resolve({
        status: 201,
        headers: {} as Headers,
        data: {
          id: 456,
          email: newUserEmail,
          role: 'owner',
          expiresAt: `2022-07-16T19:01:24.841104Z`,
        },
      })
    )

    await waitFor(() => {
      const emailInput = getByTestId('email--input')
      fireEvent.change(emailInput, {target: {value: newUserEmail}})
    })

    await act(async () => {
      const inviteButton = getByTestId('user-list-invite--button')
      await fireEvent.click(inviteButton)
    })

    await waitFor(() => {
      const userListItem = getByTestId(`invite-list-item ${newUserEmail}`)
      expect(userListItem).toHaveTextContent('Invite expiration 7/16/2022')
    })
  })

  it('adds a user to the organization, if they already belong to the account', async () => {
    const {getByTestId} = setup()

    const existingEmail = 'existing+user@example.com'

    mocked(postOrgsInvite).mockImplementation(() =>
      Promise.resolve({
        status: 200,
        headers: {} as Headers,
        data: {
          id: '101',
          firstName: 'Test',
          lastName: 'User Added to Org',
          email: existingEmail,
          role: 'owner',
        },
      })
    )

    await waitFor(() => {
      const emailInput = getByTestId('email--input')
      fireEvent.change(emailInput, {target: {value: existingEmail}})
    })

    await act(async () => {
      const inviteButton = getByTestId('user-list-invite--button')
      await fireEvent.click(inviteButton)
    })

    await waitFor(() => {
      const userListItem = getByTestId(`user-list-item ${existingEmail}`)
      expect(userListItem).toHaveTextContent('Active')
    })
  })
})
