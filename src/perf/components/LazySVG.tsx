import React, {CSSProperties, FC} from 'react'

interface Props {
  alt: string
  image: string
  style: CSSProperties
}

const LazySVG: FC<Props> = ({alt, image, style}) => {
  return <img src={image} style={style} alt={alt} />
}

export default LazySVG
