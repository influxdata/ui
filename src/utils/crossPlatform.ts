import React from 'react'

enum OperatingSystems {
  Mac = 'MacOS',
  Windows = 'Windows',
  Linux = 'Linux',
}

export const shouldOpenLinkInNewTab = (
  event: MouseEvent | React.MouseEvent
): boolean => {
  // default behavior at the time of writing this function only supports MacOS
  let OS = OperatingSystems.Mac

  if (window?.navigator?.userAgent.includes('Windows')) {
    OS = OperatingSystems.Windows
  }

  if (window?.navigator?.userAgent.includes('Linux')) {
    OS = OperatingSystems.Linux
  }

  if (OS === OperatingSystems.Mac && event.metaKey) {
    return true
  }

  if (
    (OS === OperatingSystems.Windows || OS === OperatingSystems.Linux) &&
    event.ctrlKey
  ) {
    return true
  }

  return false
}

export const keyboardCopyTriggered = (
  event: KeyboardEvent | React.KeyboardEvent
): boolean => {
  let OS = OperatingSystems.Mac

  if (window?.navigator?.userAgent.includes('Windows')) {
    OS = OperatingSystems.Windows
  }

  if (window?.navigator?.userAgent.includes('Linux')) {
    OS = OperatingSystems.Linux
  }

  // keyCode 67 is "C"
  if (
    OS === OperatingSystems.Mac &&
    event.metaKey &&
    (event.key === 'KeyC' || event.keyCode == 67)
  ) {
    return true
  }

  if (
    (OS === OperatingSystems.Windows || OS === OperatingSystems.Linux) &&
    event.ctrlKey &&
    (event.key === 'KeyC' || event.keyCode == 67)
  ) {
    return true
  }

  return false
}

export const userSelection = () => {
  return window.getSelection().toString()
}
