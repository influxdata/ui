import React, {CSSProperties, FC, useRef, useState} from 'react'
import {useIntersection} from './IntersectionObserver'

interface Props {
  alt: string
  image: string
  style: CSSProperties
}

const LazySVG: FC<Props> = ({alt, image, style}) => {
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef()
  useIntersection(imgRef, () => {
    setIsInView(true)
  })

  return (
    <div ref={imgRef}>
      {isInView && <img style={style} alt={alt} src={image} />}
    </div>
  )
}

export default LazySVG
