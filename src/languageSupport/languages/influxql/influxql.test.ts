import {testTokenization} from './testRunner'

it('comment', () => {
  testTokenization('influxql', [
    // Comments
    [
      {
        line: '-- a comment',
        tokens: [{startIndex: 0, type: 'comment.influxql'}]
      }
    ],
    [
      {
        line: '---sticky -- comment',
        tokens: [{ startIndex: 0, type: 'comment.sql' }]
      }
    ],
  ])
})