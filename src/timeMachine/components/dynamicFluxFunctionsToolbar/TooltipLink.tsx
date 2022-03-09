import React from 'react'

const TooltipLink = () => (
  <p className="tooltip--link">
    Still have questions? Check out the{' '}
    <a
      target="_blank"
      rel="noreferrer"
      href={`https://docs.influxdata.com/flux/v0.x/stdlib/`}
    >
      Flux Docs
    </a>
    .
  </p>
)
export default TooltipLink
