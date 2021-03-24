import React, {FC} from 'react'
import OperatorProvider from 'src/operator/context/operator'
import Operator from 'src/operator/Operator'

const OperatorPage: FC = () => (
  <OperatorProvider>
    <Operator />
  </OperatorProvider>
)

export default OperatorPage
