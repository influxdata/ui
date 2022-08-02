import appReducer from 'src/shared/reducers/app'
import {
  enablePresentationMode,
  disablePresentationMode,
  setTheme,
  setNavBarState,
  setAutoRefresh,
  setVersionInfo,
} from 'src/shared/actions/app'
import {TimeZone} from 'src/types'
import {AppState as AppPresentationState} from 'src/shared/reducers/app'

describe('Shared.Reducers.appReducer', () => {
  const initialState: AppPresentationState = {
    ephemeral: {
      inPresentationMode: false,
    },
    persisted: {
      autoRefresh: 0,
      showTemplateControlBar: false,
      navBarState: 'expanded',
      fluxQueryBuilder: false,
      timeZone: 'Local' as TimeZone,
      theme: 'dark',
      versionInfo: {version: '', commit: ''},
      flowsCTA: {explorer: true, tasks: true, alerts: true},
      subscriptionsCertificateInterest: false,
    },
  }

  it('should handle ENABLE_PRESENTATION_MODE', () => {
    const reducedState = appReducer(initialState, enablePresentationMode())

    expect(reducedState.ephemeral.inPresentationMode).toBe(true)
  })

  it('should handle DISABLE_PRESENTATION_MODE', () => {
    Object.assign(initialState, {ephemeral: {inPresentationMode: true}})

    const reducedState = appReducer(initialState, disablePresentationMode())

    expect(reducedState.ephemeral.inPresentationMode).toBe(false)
  })

  it('should handle SET_THEME with light theme', () => {
    const reducedState = appReducer(initialState, setTheme('light'))

    expect(reducedState.persisted.theme).toBe('light')
  })

  it('should handle SET_THEME with dark theme', () => {
    Object.assign(initialState, {persisted: {theme: 'light'}})

    const reducedState = appReducer(initialState, setTheme('dark'))

    expect(reducedState.persisted.theme).toBe('dark')
  })

  it('should handle SET_NAV_BAR_STATE to collapsed', () => {
    const reducedState = appReducer(initialState, setNavBarState('collapsed'))

    expect(reducedState.persisted.navBarState).toBe('collapsed')
  })

  it('should handle SET_NAV_BAR_STATE to expanded', () => {
    Object.assign(initialState, {persisted: {navBarState: 'collapsed'}})

    const reducedState = appReducer(initialState, setNavBarState('expanded'))

    expect(reducedState.persisted.navBarState).toBe('expanded')
  })

  it('should handle SET_AUTOREFRESH', () => {
    const expectedMs = 15000

    const reducedState = appReducer(initialState, setAutoRefresh(expectedMs))

    expect(reducedState.persisted.autoRefresh).toBe(expectedMs)
  })

  it('should handle SET_VERSION_INFO', () => {
    const expectedVersionInfo = {
      version: '2.0.0',
      commit: '1234123',
    }

    const reducedState = appReducer(
      initialState,
      setVersionInfo(expectedVersionInfo)
    )

    expect(reducedState.persisted.versionInfo).toBe(expectedVersionInfo)
  })
})
