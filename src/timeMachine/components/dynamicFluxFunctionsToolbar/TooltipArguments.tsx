import React, {PureComponent} from 'react'

interface Args {
  headline: string
  name: string
}

interface Props {
  argsList?: Args[]
}
class TooltipArguments extends PureComponent<Props> {
  public render() {
    return (
      <article>
        <div className="flux-function-docs--heading">Arguments</div>
        <div className="flux-function-docs--snippet">{this.arguments}</div>
      </article>
    )
  }
  private get arguments(): JSX.Element | JSX.Element[] {
    const {argsList} = this.props

    if (argsList.length > 0) {
      return argsList.map(argument => {
        const description = argument.headline.slice(argument.name.length + 1)
        return (
          <div className="flux-function-docs--arguments" key={argument.name}>
            <span>{argument.name}:</span>
            <div>{description}</div>
          </div>
        )
      })
    }
    return <div className="flux-function-docs--arguments">None</div>
  }
}
export default TooltipArguments
