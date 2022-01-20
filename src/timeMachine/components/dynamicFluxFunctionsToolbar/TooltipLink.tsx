import React, {SFC} from 'react'

interface Props {
  link: string
}

const TooltipLink: SFC<Props> = ({link}) => (
  <p className="tooltip--link">
    Still have questions? Check out the{' '}
    <a target="_blank" rel="noreferrer" href={link}>
      Flux Docs
    </a>
    .
  </p>
)

export default TooltipLink
