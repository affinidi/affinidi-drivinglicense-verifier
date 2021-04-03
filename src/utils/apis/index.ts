export interface FreeFormObject {}

export interface VCBuildUnsignedInput {
  type: string,
  data: FreeFormObject,
  holderDid: string
}

export interface UnsignedW3cCredential {
  '@context': FreeFormObject,
  id: string,
  type: string[],
  holder: FreeFormObject,
  credentialSubject: FreeFormObject,
  issuanceDate: string,
  expirationDate?: string,
}

export interface VCBuildUnsignedOutput {
  unsignedVC: UnsignedW3cCredential,
}

export interface SignCredentialInput {
  unsignedCredential: UnsignedW3cCredential,
}

export interface VerifyCredentialOutput {
  errors: string[],
  isValid: boolean,
}

export interface SignCredentialOutput {
  signedCredential: W3cCredential,
}

export interface W3cCredential {
  '@context': FreeFormObject,
  id: string,
  type: string[],
  holder: FreeFormObject,
  credentialSubject: FreeFormObject,
  issuanceDate: string,
  issuer: string,
  expirationDate?: string,
  proof: W3cProof,
}

export interface W3cProof {
  type?: string,
  created?: string,
  verificationMethod: string,
  proofPurpose: string,
  jws: string,
}

export interface VerifyCredentialInput {
  verifiableCredentials: W3cCredential[],
}

export interface SaveCredentialInput {
  data: W3cCredential[]
}

export interface SaveCredentialOutput {
  credentialIds: string[]
}

export interface VerifyCredentialOutput {
  errors: string[],
  isValid: boolean,
}

interface IHeader {
  typ: string,
  alg: string,
}

export interface ShareCredentialResponseToken {
  credentialShareRequest: {
    header: IHeader,
    payload: any
  }
}

export type GetSavedCredentialsOutput = W3cCredential[]
