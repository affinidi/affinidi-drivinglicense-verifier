/**
 * File containing various API endpoints.
 * */

interface Endpoints {
  SIGNUP: string,
  LOGIN: string,
  LOGOUT: string,
  WALLET_CREDENTIALS: string,
  WALLET_SIGN_CREDENTIALS: string,
  VC_BUILD_UNSIGNED: string,
  DID_RESOLVE_DID: string,
  VERIFIER_VERIFY_VCS: string,
  GENERATE_SHARE_REQUEST_TOKEN: string,
  VERIFY_SHARE_RESPONSE_TOKEN: string,
}

export const endpoints: Endpoints = {
  SIGNUP: '/users/signup',
  LOGIN: '/users/login',
  LOGOUT: '/users/logout',
  WALLET_CREDENTIALS: '/wallet/credentials',
  VC_BUILD_UNSIGNED: '/vc/build-unsigned',
  WALLET_SIGN_CREDENTIALS: '/wallet/sign-credential',
  DID_RESOLVE_DID: '/did/resolve-did',
  VERIFIER_VERIFY_VCS: '/verifier/verify-vcs',
  GENERATE_SHARE_REQUEST_TOKEN: '/verifier/build-credential-request',
  VERIFY_SHARE_RESPONSE_TOKEN: '/verifier/verify-share-response',
}
