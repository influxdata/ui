import React, {FC} from 'react'

interface Props {
  image: string
}

const LazySVG: FC<Props> = ({image}) => {
  return <img src={image} />
}

export default LazySVG
