// Libraries
import React, {SFC} from 'react'

// Components
import ToolbarFunction from 'src/flows/shared/FilterList/InjectionOption'
import FunctionTooltipContent from 'src/flows/pipes/RawFluxEditor/FunctionsList/perFunction/FunctionToolTipContent'

// Types
import {FluxToolbarFunction} from 'src/types/shared'

interface Props {
  category: string
  funcs: FluxToolbarFunction[]
  onClickFunction: (func: FluxToolbarFunction) => void
}

const FunctionCategory: SFC<Props> = props => {
  const {category, funcs, onClickFunction} = props

  return (
    <dl className="flux-toolbar--category">
      <dt className="flux-toolbar--heading">{category}</dt>
      {funcs.map(func => (
        <ToolbarFunction
          extractor={fn => (fn as FluxToolbarFunction).name}
          onClick={onClickFunction}
          key={`${func.name}_${func.desc}`}
          option={func}
          testID={func.name}
          ToolTipContent={FunctionTooltipContent}
        />
      ))}
    </dl>
  )
}

export default FunctionCategory
