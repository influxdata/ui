import * as monaco from 'monaco-editor' // from src/languageSupport/__mocks__/monacoMock.js

interface RelaxedToken {
  startIndex: number
  type: string
}

interface TestItem {
  line: string
  tokens: RelaxedToken[]
}

export const testTokenization = (
  _language: string,
  tests: TestItem[][]
): void => {
  tests.forEach(test => runTest(_language, test))
}

function runTest(languageId: string, test: TestItem[]): void {
  const text = test.map(t => t.line).join('\n')
  const actualTokens = monaco.editor.tokenize(text, languageId)
  const actual = actualTokens.map((lineTokens: any, index: number) => {
    return {
      line: test[index].line,
      tokens: lineTokens.map(t => {
        return {
          startIndex: t.offset,
          type: t.type,
        }
      }),
    }
  })

  // eslint-disable-next-line no-console
  console.log({
    languageId,
    test,
    test_tokens: test[0].tokens,
    text,
    actualTokens: actual[0].tokens,
  })
}
