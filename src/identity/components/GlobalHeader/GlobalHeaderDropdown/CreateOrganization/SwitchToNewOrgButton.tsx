import React from 'react'

const linkStyle = {
  color: 'black',
  textDecoration: 'underline',
  cursor: 'pointer',
}

export const SwitchToNewOrgButton = (url: string): JSX.Element => {
  const handleSwitchToNewOrg = () => {
    window.location.href = url
  }

  return (
    <a
      onClick={handleSwitchToNewOrg}
      data-testid="go-to-new-org--link"
      style={linkStyle}
    >
      Switch to new org.
    </a>
  )
}
