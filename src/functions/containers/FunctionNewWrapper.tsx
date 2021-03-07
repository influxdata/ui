// Libraries
import React, {FC, useContext, useEffect} from 'react'

// Components
import {FunctionListContext} from 'src/functions/context/function.list'
import FunctionEditPage from 'src/functions/components/FunctionEditPage'

const FunctionNewWrapper: FC = () => {
  const {setDraftFunctionByID} = useContext(FunctionListContext)

  useEffect(() => {
    setDraftFunctionByID()
  }, [setDraftFunctionByID])

  return <FunctionEditPage />
}

export default FunctionNewWrapper
