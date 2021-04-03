import decodeEnv from 'utils/decodeEnv';
import { config } from 'dotenv'

// load environment variables from a .env file into process.env
config()

// store current environment mode into the variable
const env = decodeEnv(process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV)

// expose specific env config variables
const envConfig = {
  env,
  apiKey: process.env.REACT_APP_API_KEY as string,
  accessApiKey: process.env.REACT_APP_API_KEY_HASH as string,
  jwtPrivateKey: process.env.REACT_APP_JWT_PRIVATE_KEY as string
};

export default envConfig
