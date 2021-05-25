// Libraries
import React from 'react'
import { prettyDOM, screen, fireEvent } from '@testing-library/react'

// Components
import AlertsColumnHeader from 'src/alerting/components/AlertsColumn'

import { renderWithReduxAndRouter } from 'src/mockState'
import { withRouterProps } from 'mocks/dummyData'
import { ResourceType } from "src/types"


jest.mock('src/resources/components/GetResources')

const title = "my title";

const setup = (override = {}) => {
  const props: Parameters<typeof AlertsColumnHeader>[0] = {
    ...withRouterProps,
    createButton: <></>,
    title,
    questionMarkTooltipContents: "?",
    tabIndex: 1,
    type: ResourceType.NotificationRules,
    children: () => <></>,
  }

  return renderWithReduxAndRouter(<AlertsColumnHeader {...props} />)
}

describe('Alerts Column Header', () => {
  it('can change search box', async () => {
    setup();

    const titleElm = await screen.getAllByText(title);
    expect(titleElm).toHaveLength(1);

    const searchInput = await screen.getByTestId(
      'filter--input rules'
    )

    const value = "searching for";
    fireEvent.change(searchInput, { target: { value } })

    expect(searchInput["value"]).toBe(value);
  })
})
