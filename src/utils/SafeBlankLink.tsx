import React, {FC} from 'react'

interface Props {
  href: string
}

// The purpose of this component is to provide a safe way to open links in a new tab/window
// that aren't vulnerable to reverse tabnabbing https://owasp.org/www-community/attacks/Reverse_Tabnabbing
export const SafeBlankLink: FC<Props> = ({children, href}) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}
