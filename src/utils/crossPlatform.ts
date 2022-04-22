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

  if (window?.navigator?.appVersion.includes('Windows')) {
    OS = OperatingSystems.Windows
  }

  if (window?.navigator?.appVersion.includes('Linux')) {
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
