// Libraries
import React, {Component} from 'react'

interface Props {
  onClear: () => void
  style?: {}
}

class ClearButton extends Component<Props> {
  public render() {
    const {onClear, style} = this.props

    return (
      <button
        style={style}
        className="searchWidget-clearButton"
        onClick={onClear}
      >
        &times;
      </button>
    )
  }
}

export default ClearButton
