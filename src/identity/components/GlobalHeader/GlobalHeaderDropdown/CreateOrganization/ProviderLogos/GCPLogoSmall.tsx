import React, {FC} from 'react'
import classnames from 'classnames'
import './GCPLogoSmall.scss'

interface Props {
  className?: string
}

export const GCPLogoSmall: FC<Props> = ({className}) => {
  const gcpClassname = classnames('gcp-logo', className)
  return (
    <svg className={gcpClassname} viewBox="0 0 70 70">
      <defs>
        <radialGradient
          id="a"
          cx="10.006"
          cy="5.569"
          r="74.078"
          gradientTransform="translate(0.52 -0.697) scale(0.889 0.889)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fff" stopOpacity="0.102" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform="translate(0 0)">
        <path
          className="google-red"
          d="M53.69,25.2h2.14l6.08-6.08.3-2.59A27.35,27.35,0,0,0,17.72,29.88a3.31,3.31,0,0,1,2.13-.13l12.17-2s.62-1,.94-1A15.19,15.19,0,0,1,53.74,25.2Z"
          transform="translate(-9.28 -9.69)"
        />
        <path
          className="google-blue"
          d="M70.58,29.88a27.42,27.42,0,0,0-8.26-13.32L53.78,25.1a15.14,15.14,0,0,1,5.57,12v1.52a7.6,7.6,0,1,1,0,15.2H44.15L42.63,55.4v9.12L44.15,66h15.2A19.77,19.77,0,0,0,70.58,29.88Z"
          transform="translate(-9.28 -9.69)"
        />
        <path
          className="google-green"
          d="M28.93,65.94h15.2V53.77H28.93a7.56,7.56,0,0,1-3.14-.69l-2.14.67-6.12,6.08L17,62A19.64,19.64,0,0,0,28.93,65.94Z"
          transform="translate(-9.28 -9.69)"
        />
        <path
          className="google-yellow"
          d="M28.93,26.46A19.77,19.77,0,0,0,17,61.9l8.82-8.81A7.6,7.6,0,1,1,35.87,43l8.81-8.81A19.74,19.74,0,0,0,28.93,26.46Z"
          transform="translate(-9.28 -9.69)"
        />
      </g>
    </svg>
  )
}
