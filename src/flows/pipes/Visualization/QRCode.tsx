import React, {FC, useEffect, useRef} from 'react'
import {InfluxColors} from '@influxdata/clockface'
import QRCode from 'qrcode.react'

type Props = {
  url: string
}

const QRComponent: FC<Props> = ({url}) => {
  const ref = useRef(null)
  const [size, setSize] = React.useState(100)

  useEffect(() => {
    if (!ref?.current) {
      return
    }
    setSize(ref.current.getBoundingClientRect().width)
  }, [])

  return (
    <div ref={ref} className="qr-code">
      <QRCode
        value={url}
        size={size}
        fgColor={InfluxColors.Fire}
        bgColor={InfluxColors.White}
        imageSettings={{
          src: 'https://www.influxdata.com/wp-content/uploads/Favicon-blue-200x200.png',
          width: size * 0.2,
          height: size * 0.2,
          excavate: true,
        }}
      />
    </div>
  )
}

export default QRComponent
