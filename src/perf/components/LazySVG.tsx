import React, {CSSProperties, FC} from 'react'

interface Props {
  image: string
  style: CSSProperties
}

const LazySVG: FC<Props> = ({image, style}) => {
  return <img src={image} style={style} />
}

export default LazySVG
