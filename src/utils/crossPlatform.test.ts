import {
  shouldOpenLinkInNewTab,
  keyboardCopyTriggered,
  userSelection,
  isUsingWindows,
  isUsingMac,
  isUsingLinux,
} from 'src/utils/crossPlatform'

let userAgentGetter
let userSelectionGetter

describe('checking whether a link should be opened in a new tab', () => {
  beforeEach(() => {
    userAgentGetter = jest.spyOn(global.window.navigator, 'userAgent', 'get')
    userSelectionGetter = jest.spyOn(global.window, 'getSelection')
  })

  describe('checking on MacOS', () => {
    beforeEach(() => {
      userAgentGetter.mockReturnValue('5.0 Macintosh')
      userSelectionGetter.mockReturnValue('test')
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

    it('triggers a copy when the meta key and c key are pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', {
        metaKey: true,
        key: 'KeyC',
      })
      expect(keyboardCopyTriggered(keyEvent)).toBeTruthy()
    })

    it('does not trigger a copy when the meta key and d key are pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', {
        metaKey: true,
        key: 'KeyD',
      })
      expect(keyboardCopyTriggered(keyEvent)).toBeFalsy()
    })

    it('does not trigger a copy when the meta key is pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', {
        metaKey: true,
      })
      expect(keyboardCopyTriggered(keyEvent)).toBeFalsy()
    })

    it('does not trigger a copy when the c key is pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'KeyC',
      })
      expect(keyboardCopyTriggered(keyEvent)).toBeFalsy()
    })

    it('does not trigger a copy when nothing is pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', {})
      expect(keyboardCopyTriggered(keyEvent)).toBeFalsy()
    })

    it('gets the correct selection', () => {
      expect(userSelection()).toBe('test')
    })
  })

  describe('checking on Windows', () => {
    beforeEach(() => {
      userAgentGetter.mockReturnValue('5.0 Windows')
      userSelectionGetter.mockReturnValue('test')
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

    it('triggers a copy when the ctrl key and c key are pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', {
        ctrlKey: true,
        key: 'KeyC',
      })
      expect(keyboardCopyTriggered(keyEvent)).toBeTruthy()
    })

    it('does not trigger a copy when the ctrl key and d key are pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', {
        ctrlKey: true,
        key: 'KeyD',
      })
      expect(keyboardCopyTriggered(keyEvent)).toBeFalsy()
    })

    it('does not trigger a copy when the meta key is pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', {
        ctrlKey: true,
      })
      expect(keyboardCopyTriggered(keyEvent)).toBeFalsy()
    })

    it('does not trigger a copy when the c key is pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'KeyC',
      })
      expect(keyboardCopyTriggered(keyEvent)).toBeFalsy()
    })

    it('does not trigger a copy when nothing is pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', {})
      expect(keyboardCopyTriggered(keyEvent)).toBeFalsy()
    })

    it('gets the correct selection', () => {
      expect(userSelection()).toBe('test')
    })
  })

  describe('checking on GNU/Linux', () => {
    beforeEach(() => {
      userAgentGetter.mockReturnValue('5.0 Linux')
      userSelectionGetter.mockReturnValue('test')
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

    it('triggers a copy when the ctrl key and c key are pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', {
        ctrlKey: true,
        key: 'KeyC',
      })
      expect(keyboardCopyTriggered(keyEvent)).toBeTruthy()
    })

    it('does not trigger a copy when the ctrl key and d key are pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', {
        ctrlKey: true,
        key: 'KeyD',
      })
      expect(keyboardCopyTriggered(keyEvent)).toBeFalsy()
    })

    it('does not trigger a copy when the meta key is pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', {
        ctrlKey: true,
      })
      expect(keyboardCopyTriggered(keyEvent)).toBeFalsy()
    })

    it('does not trigger a copy when the c key is pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'KeyC',
      })
      expect(keyboardCopyTriggered(keyEvent)).toBeFalsy()
    })

    it('does not trigger a copy when nothing is pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', {})
      expect(keyboardCopyTriggered(keyEvent)).toBeFalsy()
    })

    it('gets the correct selection', () => {
      expect(userSelection()).toBe('test')
    })
  })
})

describe('which operating system', () => {
  beforeEach(() => {
    userAgentGetter = jest.spyOn(global.window.navigator, 'userAgent', 'get')
  })
  it('is windows', () => {
    userAgentGetter.mockReturnValue('5.0 Windows')
    expect(isUsingWindows()).toBeTruthy()
  })
  it('is mac', () => {
    userAgentGetter.mockReturnValue('5.0 Macintosh')
    expect(isUsingMac()).toBeTruthy()
  })
  it('is linux', () => {
    userAgentGetter.mockReturnValue('5.0 Linux')
    expect(isUsingLinux()).toBeTruthy()
  })
  it('is not windows', () => {
    userAgentGetter.mockReturnValue('5.0 Macintosh')
    expect(isUsingWindows()).toBeFalsy()
  })
  it('is not mac', () => {
    userAgentGetter.mockReturnValue('5.0 Windows')
    expect(isUsingMac()).toBeFalsy()
  })
  it('is not linux', () => {
    userAgentGetter.mockReturnValue('5.0 Macintosh')
    expect(isUsingLinux()).toBeFalsy()
  })
})
