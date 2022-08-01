import React from 'react'

enum OperatingSystems {
  Mac = 'MacOS',
  Windows = 'Windows',
  Linux = 'Linux',
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

  if (OS === OperatingSystems.Mac && event.metaKey && event.keyCode == 67) {
    return true
  }

  if (
    (OS === OperatingSystems.Windows || OS === OperatingSystems.Linux) &&
    event.ctrlKey &&
    event.keyCode == 67
  ) {
    return true
  }

  return false
}
