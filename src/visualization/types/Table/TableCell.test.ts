import {asLink} from './TableCell'

describe('TableCell.asLink', () => {
  it('Properly handles various base data types, ignoring non-strings', () => {
    expect(asLink('a regular string')).toEqual('a regular string')
    expect(asLink(NaN)).toEqual(NaN)
    expect(asLink(true)).toEqual(true)
    expect(asLink(42)).toEqual(42)
    expect(asLink(undefined)).toEqual(undefined)
    expect(asLink(null)).toEqual(null)
    expect(asLink({})).toEqual({})
    expect(asLink([])).toEqual([])
    const array = [1, 'a']
    expect(asLink(array)).toEqual(array)
    const jsonObject = {color: '#4286f4', description: 'the best of labels'}
    expect(asLink(jsonObject)).toEqual(jsonObject)
    const regularObject = {}
    regularObject['color'] = '#4286f4'
    regularObject['description'] = 'the best of labels'
    expect(asLink(regularObject)).toEqual(regularObject)

    const objectPropertiesAreIgnored = {'https://www.google.com': 'not a link'}
    expect(objectPropertiesAreIgnored).toEqual(objectPropertiesAreIgnored)
  })

  it('Handles basic links', () => {
    const insecureLink = asLink('http://www.google.com')
    expect(insecureLink).toHaveLength(1)
    expect(insecureLink[0].props.href).toEqual('http://www.google.com')
    expect(insecureLink[0].props.target).toEqual('_blank')
    expect(insecureLink[0].props.rel).toEqual('noreferrer')
    expect(insecureLink[0].props.children).toEqual('http://www.google.com')

    const secureLink = asLink('https://www.influxdata.com')
    expect(secureLink).toHaveLength(1)
    expect(secureLink[0].props.href).toEqual('https://www.influxdata.com')
    expect(secureLink[0].props.children).toEqual('https://www.influxdata.com')

    const signupLink = asLink('https://cloud2.influxdata.com/signup')
    expect(signupLink).toHaveLength(1)
    expect(signupLink[0].props.href).toEqual(
      'https://cloud2.influxdata.com/signup'
    )
    expect(signupLink[0].props.children).toEqual(
      'https://cloud2.influxdata.com/signup'
    )
  })

  it('Handles text and link combinations appropriately', () => {
    const textBeforeLink = asLink(
      'Make it do what it do at https://www.influxdata.com'
    )
    expect(textBeforeLink).toHaveLength(2)
    expect(textBeforeLink[0]).toEqual('Make it do what it do at ')
    expect(textBeforeLink[1].props.href).toEqual('https://www.influxdata.com')
    expect(textBeforeLink[1].props.children).toEqual(
      'https://www.influxdata.com'
    )

    const linkBeforeText = asLink(
      'https://www.influxdata.com Make it do what it do'
    )
    expect(linkBeforeText).toHaveLength(2)
    expect(linkBeforeText[0].props.href).toEqual('https://www.influxdata.com')
    expect(linkBeforeText[0].props.children).toEqual(
      'https://www.influxdata.com'
    )
    expect(linkBeforeText[1]).toEqual(' Make it do what it do')

    const linkSandwich = asLink(
      'Hungry? Why wait? https://www.snickers.com today'
    )
    expect(linkSandwich).toHaveLength(3)
    expect(linkSandwich[0]).toEqual('Hungry? Why wait? ')
    expect(linkSandwich[1].props.href).toEqual('https://www.snickers.com')
    expect(linkSandwich[1].props.children).toEqual('https://www.snickers.com')
    expect(linkSandwich[2]).toEqual(' today')

    const doubleLinks = asLink(
      'https://www.google.com https://www.influxdata.com'
    )
    expect(doubleLinks).toHaveLength(3)
    expect(doubleLinks[0].props.href).toEqual('https://www.google.com')
    expect(doubleLinks[0].props.children).toEqual('https://www.google.com')
    expect(doubleLinks[1]).toEqual(' ')
    expect(doubleLinks[2].props.href).toEqual('https://www.influxdata.com')
    expect(doubleLinks[2].props.children).toEqual('https://www.influxdata.com')

    const textSandwich = asLink(
      'https://www.google.com or perhaps https://www.influxdata.com'
    )
    expect(textSandwich).toHaveLength(3)
    expect(textSandwich[0].props.href).toEqual('https://www.google.com')
    expect(textSandwich[0].props.children).toEqual('https://www.google.com')
    expect(textSandwich[1]).toEqual(' or perhaps ')
    expect(textSandwich[2].props.href).toEqual('https://www.influxdata.com')
    expect(textSandwich[2].props.children).toEqual('https://www.influxdata.com')

    const linkTextLinkText = asLink(
      'https://www.google.com or perhaps https://www.influxdata.com or not'
    )
    expect(linkTextLinkText).toHaveLength(4)
    expect(linkTextLinkText[0]).toEqual(textSandwich[0])
    expect(linkTextLinkText[1]).toEqual(' or perhaps ')
    expect(linkTextLinkText[2]).toEqual(textSandwich[2])
    expect(linkTextLinkText[3]).toEqual(' or not')

    const textLinkTextLink = asLink(
      'oh no not https://www.google.com or perhaps https://www.influxdata.com'
    )
    expect(textLinkTextLink).toHaveLength(4)
    expect(textLinkTextLink[0]).toEqual('oh no not ')
    expect(textLinkTextLink[1]).toEqual(textSandwich[0])
    expect(textLinkTextLink[2]).toEqual(' or perhaps ')
    expect(textLinkTextLink[3]).toEqual(textSandwich[2])
  })

  it('Handles almost links with aplomb', () => {
    const gopher = asLink('gopher://www.notathinganymore.com')
    expect(gopher).toEqual('gopher://www.notathinganymore.com')
    const ftp = asLink('ftp://www.hiiminsecure.com')
    expect(ftp).toEqual('ftp://www.hiiminsecure.com')
    const soclose = asLink('htt://www.google.com')
    expect(soclose).toEqual('htt://www.google.com')
    const soclose2 = asLink('http:/www.google.com')
    expect(soclose2).toEqual('http:/www.google.com')
    const backwards = asLink('http:\\\\www.google.com')
    expect(backwards).toEqual('http:\\\\www.google.com')
  })

  it('can handle stringified json gracefully', () => {
    const json = JSON.stringify({
      message: 'not a link',
      url: 'https://www.google.com',
    })
    const jsonAsLink = asLink(json)
    expect(jsonAsLink).toHaveLength(2)
    expect(jsonAsLink[0]).toEqual('{"message":"not a link","url":"')
    // The link is bad but we can't stop people adding bad links.  At least it won't fall over - JF
    expect(jsonAsLink[1].props.href).toEqual('https://www.google.com"}')
  })
})
