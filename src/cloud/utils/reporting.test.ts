import {cleanTags} from 'src/cloud/utils/reporting'

describe('cleaning tags before sending to app-metrics', () => {
  // this throws a typescript error because tags cannot have boolean values. Is checking for boolean values necessary?
  describe.skip('tags with boolean values', () => {
    it('casts booleans as strings', () => {
      /* const point = {measurement: 'Minus the Bear', fields: {songTitle: 'Pantsuit, ugghhh'}, tags: {truthy: true}}

    expect(cleanTags(point).tags).toEqual({truthy: 'true'})

    point.tags = {truthy: false}
    expect(cleanTags(point).tags).toEqual({truthy: 'false'})*/
    })
  })

  describe('tags with numerical values', () => {
    it('converts tags that are numbers to strings', () => {
      const point = {
        measurement: 'Minus the Bear',
        fields: {songTitle: 'Hey! Is that a ninja up there?'},
        tags: {trackNumber: 5},
      }
      expect(cleanTags(point).tags).toEqual({trackNumber: '5'})
    })

    it('handles tags that are strings that look like numbers', () => {
      const point = {
        measurement: 'Minus the Bear',
        fields: {songTitle: 'Houston, we have uh oh'},
        tags: {trackNumber: '7'},
      }
      expect(cleanTags(point).tags).toEqual({trackNumber: '7'})
    })
  })

  describe('tags with string values', () => {
    it('trims newlines at the end of the line', () => {
      const point = {
        measurement: 'Minus the Bear',
        fields: {songTitle: 'Houston, we have uh oh'},
        tags: {album: 'They Make Beer Commercials Like This\n'},
      }
      expect(cleanTags(point).tags).toEqual({
        album: 'They Make Beer Commercials Like This',
      })
    })

    it('keeps newlines not at the end of the line', () => {
      const point = {
        measurement: 'Minus the Bear',
        fields: {songTitle: 'Houston, we have uh oh'},
        tags: {album: 'They Make Beer Commercials\nLike This\n'},
      }
      expect(cleanTags(point).tags).toEqual({
        album: 'They Make Beer Commercials\nLike This',
      })
    })

    it('trims whitespace at the end of the line', () => {
      const point = {
        measurement: 'Minus the Bear',
        fields: {songTitle: 'Houston, we have uh oh'},
        tags: {
          album:
            'They Make Beer Commercials Like This                                                 ',
        },
      }
      expect(cleanTags(point).tags).toEqual({
        album: 'They Make Beer Commercials Like This',
      })
    })
  })

  describe('no tags', () => {
    const point = {
      measurement: 'Minus the Bear',
      fields: {songTitle: 'Houston, we have uh oh'},
      tags: {},
    }

    expect(cleanTags(point).tags).toEqual({})
  })
})
