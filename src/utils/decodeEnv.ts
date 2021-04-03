/*
 * @affinidi/wallet-browser-sdk expects an env variable that matches either of these three values 'staging|dev|prod'
 */
function decodeEnv(env: string): "dev" | "staging" | "prod" {
  switch(env) {
    case "dev":
    case "prod":
      return env;
    case "development":
      return "dev";
    case "production":
      return "prod";
    default:
      return "staging";
  }
}

export default decodeEnv
