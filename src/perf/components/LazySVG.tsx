import React, {CSSProperties, FC} from 'react'
// import {LazyLoadImage} from 'react-lazy-load-image-component'

interface Props {
  alt: string
  image: string
  style: CSSProperties
}

const LazySVG: FC<Props> = ({alt, image, style}) => {
  return <img src={image} style={style} alt={alt} />
}

// const LazySVG: FC<Props> = ({image, alt, style}) => (
//   <div>
//     <LazyLoadImage
//       alt={alt}
//       src={image}
//       style={style}
//       visibleByDefault={true}
//     />
//   </div>
// )

// const LazySVG: FC<Props> = ({alt, image, style}) => {
//   return (
//     <LazyLoad>
//       <img src={image} style={style} alt={alt} />
//     </LazyLoad>
//   )
// }

// const LazySVG: FC<Props> = ({ alt, image, style }) => {
//   return (
//     <object type="image/svg+xml" data={image} name={alt} style={style}></object>
//   )
// }

export default LazySVG
