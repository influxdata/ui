// Libraries
import React, {FC, useEffect} from 'react'

// Components
import DocSearch from 'src/shared/search/DocSearch'

import './DocSearchWidget.scss'

const DocSearchWidget: FC = () => {
  return (
    <div className="WidgetSearch">
      <DocSearch />
      <p className="WidgetHelperText">Press CTRL + h on any page to search</p>
    </div>
  )
}

export default DocSearchWidget
