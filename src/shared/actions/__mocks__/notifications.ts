export const notify = jest.fn(() => {
  return {
    type: 'PUBLISH_NOTIFICATION',
    payload: {notification: 'notification message'},
  }
})
