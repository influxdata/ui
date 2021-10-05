import {useEffect} from 'react'

import html2Canvas from 'html2canvas'
import jsPDF from 'jspdf'

const DownloadAsPDF = ({pipeID}) => {
  useEffect(() => {
    const canvas = document.getElementById(pipeID)

    setTimeout(() => {
      html2Canvas(canvas as HTMLDivElement).then(result => {
        const doc = new jsPDF({
          orientation: 'l',
          unit: 'pt',
          format: [result.width, result.height],
        })
        doc.addImage(
          result.toDataURL('image/png'),
          'PNG',
          0,
          0,
          result.width,
          result.height
        )
        doc.save('sample-file.pdf')
      })
    }, 0)
  }, [])

  return null
}
export default DownloadAsPDF
