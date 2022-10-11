export const formatDownloadName = (filename: string, extension: string) => {
  return `${filename.trim().toLowerCase().replace(/\s/g, '_')}${extension}`
}

// Future options:
// if we want to download without converting to a blob within memory,
// then can use the new FileSystem web API
// https://developer.mozilla.org/en-US/docs/Web/API/File_and_Directory_Entries_API/
// And use a FileSystem write stream, connected to the `response.body` ReadableStream
export const downloadBlob = (
  blob: Blob,
  filename: string,
  extension: string
) => {
  const formattedName = formatDownloadName(filename, extension)

  const a = document.createElement('a')

  a.href = window.URL.createObjectURL(blob)
  a.target = '_blank'
  a.download = formattedName

  document.body.appendChild(a)
  a.click()
  a.parentNode.removeChild(a)
}

export const downloadTextFile = (
  text: string,
  filename: string,
  extension: string,
  mimeType: string = 'text/plain'
) => {
  const formattedName = formatDownloadName(filename, extension)

  const blob = new Blob([text], {type: mimeType})
  const a = document.createElement('a')

  a.href = window.URL.createObjectURL(blob)
  a.target = '_blank'
  a.download = formattedName

  document.body.appendChild(a)
  a.click()
  a.parentNode.removeChild(a)
}

export const downloadImage = (uri: string, filename: string) => {
  const link = document.createElement('a')

  if (typeof link.download === 'string') {
    link.href = uri
    link.download = filename

    // Firefox requires the link to be in the body
    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)
  } else {
    window.open(uri)
  }
}
