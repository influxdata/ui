// Allow typescript to recognize json files

declare module '*.json' {
  const value: any
  export default value
}

declare module '*.md' {
  const value: string
  export default value
}
