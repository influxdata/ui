import {formatAnnotationQueryString} from 'src/annotations/utils/formatQueryString'

describe('query string formatting function', () => {
  it('properly handles all potential properties for get/delete requests for annotations', () => {
    const query = {
      stream: 'default stream',
      start: Date.now().toString(),
      end: Date.now().toString(),
      summary: 'look ma, no spaces!',
      stickers: {
        foo: 'bar',
      },
    }

    const queryString = formatAnnotationQueryString(query)

    // Handles spaces
    expect(queryString.indexOf(' ')).toEqual(-1)
    expect(queryString.includes('default+stream')).toBeTruthy()

    // Handles encoding of object params for stickers
    expect(queryString.includes('&stickerIncludes%5Bfoo%5D=bar')).toBeTruthy()
  })
})
