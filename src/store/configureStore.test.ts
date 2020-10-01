import {getStore} from 'src/store/configureStore'

describe('configuring a store', () => {
  it('is an idempotent singleton', () => {
    expect(getStore()).toBe(getStore())
  })
})
