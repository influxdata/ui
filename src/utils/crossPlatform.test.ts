import {shouldOpenLinkInNewTab} from 'src/utils/crossPlatform'

let appVersionGetter

describe('checking whether a link should be opened in a new tab', () => {
  beforeEach(() => {
    appVersionGetter = jest.spyOn(global.window.navigator, 'appVersion', 'get')
  })

  describe('checking on MacOS', () => {
    beforeEach(() => {
      appVersionGetter.mockReturnValue('5.0 Macintosh')
    })

    it('opens the link in a new tab when the meta key is pressed', () => {
      const mouseEvent = new MouseEvent('click', {metaKey: true})
      expect(shouldOpenLinkInNewTab(mouseEvent)).toBeTruthy()
    })

    it('does not open the link in a new tab when the control key is pressed', () => {
      const mouseEvent = new MouseEvent('click', {ctrlKey: true})
      expect(shouldOpenLinkInNewTab(mouseEvent)).toBeFalsy()
    })

    it('does not open the link in a new tab when no modifier key is pressed', () => {
      const mouseEvent = new MouseEvent('click')
      expect(shouldOpenLinkInNewTab(mouseEvent)).toBeFalsy()
    })
  })

  describe('checking on Windows', () => {
    beforeEach(() => {
      appVersionGetter.mockReturnValue('5.0 Windows')
    })

    it('opens the link in a new tab when the control key is pressed', () => {
      const mouseEvent = new MouseEvent('click', {ctrlKey: true})
      expect(shouldOpenLinkInNewTab(mouseEvent)).toBeTruthy()
    })

    it('does not open the link in a new tab when the meta key is pressed', () => {
      const mouseEvent = new MouseEvent('click', {metaKey: true})
      expect(shouldOpenLinkInNewTab(mouseEvent)).toBeFalsy()
    })

    it('does not open the link in a new tab when no modifier key is pressed', () => {
      const mouseEvent = new MouseEvent('click')
      expect(shouldOpenLinkInNewTab(mouseEvent)).toBeFalsy()
    })
  })

  describe('checking on GNU/Linux', () => {
    beforeEach(() => {
      appVersionGetter.mockReturnValue('5.0 Linux')
    })

    it('opens the link in a new tab when the control key is pressed', () => {
      const mouseEvent = new MouseEvent('click', {ctrlKey: true})
      expect(shouldOpenLinkInNewTab(mouseEvent)).toBeTruthy()
    })

    it('does not open the link in a new tab when the meta key is pressed', () => {
      const mouseEvent = new MouseEvent('click', {metaKey: true})
      expect(shouldOpenLinkInNewTab(mouseEvent)).toBeFalsy()
    })

    it('does not open the link in a new tab when no modifier key is pressed', () => {
      const mouseEvent = new MouseEvent('click')
      expect(shouldOpenLinkInNewTab(mouseEvent)).toBeFalsy()
    })
  })
})
