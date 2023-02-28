module.exports = {
  languages: {
    register: function(language) {},
    setMonarchTokensProvider: function(name, tokens) {},
    setLanguageConfiguration: function(name, config) {}
  },
  editor: {
    defineTheme: function(name, theme) {},
    tokenize: jest.fn().mockReturnValue([[]])
  }
};
