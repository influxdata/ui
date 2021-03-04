// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {useParams} from 'react-router-dom'

// Components
import {FunctionListContext} from 'src/functions/context/function.list'
import FunctionEditPage from 'src/functions/components/FunctionEditPage'

// Utils

const FunctionEditRouter: FC = () => {
  const {id: functionID} = useParams<{id: string}>()

  const {setDraftFunctionWithID} = useContext(FunctionListContext)

  useEffect(() => {
    setDraftFunctionWithID(functionID)
  }, [functionID, setDraftFunctionWithID])

  return <FunctionEditPage />
}

export default FunctionEditRouter
