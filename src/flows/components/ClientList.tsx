import React, {FC, useContext} from 'react'
import {Context as SidebarContext} from 'src/flows/context/sidebar'

const ClientList: FC = () => {
  const {id} = useContext(SidebarContext)

  return (
    <div />
  )
}

export default ClientList
