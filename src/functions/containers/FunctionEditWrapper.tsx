// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {useParams} from 'react-router-dom'

// Components
import {FunctionListContext} from 'src/functions/context/function.list'
import FunctionEditPage from 'src/functions/components/FunctionEditPage'

// Utils

const FunctionEditWrapper: FC = () => {
  const {id: functionID} = useParams<{id: string}>()

  const {setDraftFunctionByID} = useContext(FunctionListContext)

  useEffect(() => {
    setDraftFunctionByID(functionID)
  }, [functionID, setDraftFunctionByID])

  return <FunctionEditPage />
}

export default FunctionEditWrapper
