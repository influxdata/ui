// Libraries
import React, {FC} from 'react'

// Components
import WriteDataIndexView from 'src/writeData/components/WriteDataIndexView'

// Constants
import WRITE_DATA_NATIVE_METHODS_SECTION from 'src/writeData/constants/contentNativeMethods'

const NativeMethodsIndex: FC = ({children}) => {
  return (
    <>
      <WriteDataIndexView content={WRITE_DATA_NATIVE_METHODS_SECTION} />
      {children}
    </>
  )
}

export default NativeMethodsIndex
