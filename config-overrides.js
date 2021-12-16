module.exports = {
  webpack: function (config, env)
  {
    // ...add your webpack config
    const temp = {
      ...config,
      "resolve": {
        "fallback": {
          "stream": false,
          "crypto": false,
          "assert": false
        }
      },
    }

    return temp;
  }
}