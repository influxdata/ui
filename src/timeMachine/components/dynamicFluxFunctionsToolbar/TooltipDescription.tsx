import React, {FC} from 'react'

interface Props {
  description: string
}

const TooltipDescription: FC<Props> = ({description}) => (
  <article className="flux-functions-toolbar--description">
    <div className="flux-function-docs--heading">Description</div>
    <span>{description}</span>
  </article>
)

export default TooltipDescription
