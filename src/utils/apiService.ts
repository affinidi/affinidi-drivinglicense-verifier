import LOCAL_STORAGE_KEY from 'constants/localstorage';
import {cloudWalletApi, issuerApi, verifierApi} from 'utils/api';
import {endpoints} from 'constants/endpoints';
import {
  GetSavedCredentialsOutput,
  SaveCredentialInput, SaveCredentialOutput,
  SignCredentialInput,
  SignCredentialOutput,
  VCBuildUnsignedInput,
  VCBuildUnsignedOutput, VerifyCredentialInput, VerifyCredentialOutput,
  ShareCredentialResponseToken
} from 'utils/apis';

/**
 * Static class providing useful methods for reaching different endpoints
 * and managing app localstorage.
 * */
export default class ApiService {
  /**
   * Method for creating a new user account.
   * Current project setup supports only arbitrary username usage, but email or phone numbers can be used as well.
   * Endpoint info: https://cloud-wallet-api.staging.affinity-project.org/api-docs/#/User/SignUp.
   * */
  static async signUp(username: string, password: string) {
    const signUpParams = { username, password }
    const {data} =  await cloudWalletApi.post(endpoints.SIGNUP, signUpParams);

    return data;
  }

  /**
   * Method for logging in existing user into the network.
   * Endpoint info: https://cloud-wallet-api.staging.affinity-project.org/api-docs/#/User/Login.
   * */
  static async logIn(username: string, password: string) {
    const loginParams = { username, password }
    const a =  await cloudWalletApi.post(endpoints.LOGIN, loginParams)

    return a.data;
  }

  /**
   * Shortcut method for storing access and DID tokens into localstorage,
   * and setting authorization bearer on our axios API instance(s).
   * */
  static clientSideLogIn(accessToken: string, did: string) {
    ApiService.storeAccessAndDidTokens(accessToken, did)
    ApiService.setAuthorizationBearer(accessToken);
  }

  /**
   * Method for logging user on both backend and client side.
   * Endpoint info: https://cloud-wallet-api.staging.affinity-project.org/api-docs/#/User/Logout.
   * */
  static async logout() {
    await cloudWalletApi.post(endpoints.LOGOUT)

    ApiService.removeAccessAndDidTokens()
  }

  /**
   * Method for issuing an unsigned VC.
   * Endpoint info: https://affinity-issuer.staging.affinity-project.org/api-docs/#/VC/BuildUnsigned.
   * */
  static async issueUnsignedVC(example: VCBuildUnsignedInput) {
    const {data} = await issuerApi.post<VCBuildUnsignedOutput>(endpoints.VC_BUILD_UNSIGNED, example);

    return data;
  }

  /**
   * Method for signing a VC.
   * Endpoint info: https://cloud-wallet-api.staging.affinity-project.org/api-docs/#/Wallet/SignCredential.
   * */
  static async signVC(input: SignCredentialInput) {
    const {data} = await cloudWalletApi.post<SignCredentialOutput>(endpoints.WALLET_SIGN_CREDENTIALS, input);

    return data;
  }

  /**
   * Method for verifying multiple VCs.
   * Endpoint info: https://affinity-verifier.staging.affinity-project.org/api-docs/#/Verifier/VerifyCredentials.
   * */
  static async verifyVC(input: VerifyCredentialInput) {
    const {data} = await verifierApi.post<VerifyCredentialOutput>(endpoints.VERIFIER_VERIFY_VCS, input)

    return data;
  }

  /**
   * Method for storing signed VCs.
   * Endpoint info: https://cloud-wallet-api.staging.affinity-project.org/api-docs/#/Wallet/StoreCredentials.
   * */
  static async storeSignedVCs(data: SaveCredentialInput) {
    const response = await cloudWalletApi.post<SaveCredentialOutput>(endpoints.WALLET_CREDENTIALS, data)

    return response.data;
  }

  /**
   * Method for retrieving saved VCs.
   * Note: you might have to install a CORS extension for this endpoint if you are using Chrome browser. Tested
   * with "CORS Unblock" for Chrome (https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino/).
   * Endpoint info: https://cloud-wallet-api.staging.affinity-project.org/api-docs/#/Wallet/GetCredentials.
   * */
  static async getSavedVCs() {
    const {data} = await cloudWalletApi.get<GetSavedCredentialsOutput>(endpoints.WALLET_CREDENTIALS)

    return data;
  }

  /**
   * Method for deleting stored VC.
   * Endpoint info: https://cloud-wallet-api.staging.affinity-project.org/api-docs/#/Wallet/DeleteCredential.
   * */
  static async deleteStoredVC(VCId: string) {
    await cloudWalletApi.delete(`${endpoints.WALLET_CREDENTIALS}/${VCId}`)
  }

  /**
   * Shortcut method for storing access and DID tokens into localstorage.
   * */
  static storeAccessAndDidTokens(accessToken: string, did: string) {
    ApiService.saveAccessTokenToLocalStorage(accessToken);
    ApiService.saveDidTokenToLocalStorage(did);
  }

  /**
   * Shortcut method for removing access and DID tokens from localstorage.
   * */
  static removeAccessAndDidTokens() {
    ApiService.removeAccessTokenFromLocalStorage()
    ApiService.removeDidTokenFromLocalStorage()
  }

  /**
   * Method for setting authorization token in cloud wallet axios instance.
   * Important for communicating with backend services.
   * */
  static setAuthorizationBearer = (accessToken: string) => {
    cloudWalletApi.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  /**
   * Method for storing access token into localstorage.
   * */
  static saveAccessTokenToLocalStorage(accessToken: string) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY.ACCESS_TOKEN, accessToken)
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Method for retrieving access token from localstorage.
   * */
  static getAccessTokenFromLocalStorage() {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY.ACCESS_TOKEN)
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Method for removing access token from localstorage.
   * */
  static removeAccessTokenFromLocalStorage() {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY.ACCESS_TOKEN)
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Method for storing DID token into localstorage.
   * */
  static saveDidTokenToLocalStorage(did: string) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY.DID_TOKEN, did)
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Method for retrieving DID token from localstorage.
   * */
  static getDidTokenToLocalStorage() {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY.DID_TOKEN)
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Method for removing DID token from localstorage.
   * */
  static removeDidTokenFromLocalStorage() {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY.DID_TOKEN)
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Method for showing the user a generic message when a request fails or an error has been thrown.
   * */
  static alertWithBrowserConsole(consoleMessage: null | string | string[] = null, alertMessage?: string) {
    if( consoleMessage ) {
      console.log(consoleMessage);
    }

    alert(alertMessage || 'There has been an issue processing your request. Please check the browser console.')
  }


  /**
   * Method for generating Share Credential Request Token.
   * Endpoint info: https://affinity-verifier.staging.affinity-project.org/api-docs/#/Verifier/BuildCredentialRequest.
   * */
  static async generateShareCredReqJWT(input: any) {
    const {data} = await verifierApi.post<ShareCredentialResponseToken>(endpoints.GENERATE_SHARE_REQUEST_TOKEN, input);

    return data;
  }

    /**
   * Method for Verifying Credential Response Token.
   * Endpoint info: https://affinity-verifier.staging.affinity-project.org/api-docs/#/Verifier/VerifyCredentialShareResponse.
   * */
  static async verifyShareCredResJWT(input: any) {
    const {data} = await verifierApi.post<any>(endpoints.VERIFY_SHARE_RESPONSE_TOKEN, input);

    return data;
  }
}
