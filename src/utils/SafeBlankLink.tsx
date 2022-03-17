import React, {FC} from 'react'

interface Props {
  href: string
  onClick?: any
}

// The purpose of this component is to provide a safe way to open links in a new tab/window
// that aren't vulnerable to reverse tabnabbing https://owasp.org/www-community/attacks/Reverse_Tabnabbing
export const SafeBlankLink: FC<Props> = (props) => {
  const {children} = props
  return (
    <a target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  )
}
