import { AffinityWallet as Wallet } from "@affinidi/wallet-browser-sdk";
import { __dangerous } from "@affinidi/wallet-core-sdk";
import config from "utils/config";

const { WalletStorageService } = __dangerous;

const SDK_OPTIONS = {
  env: config.env,
  apiKey: config.apiKey,
};

class SDKConfigurator {
  static getSdkOptions() {
    const { env, apiKey } = SDK_OPTIONS;
    // @ts-ignore
    const options = Wallet.setEnvironmentVarialbles({ env });

    return Object.assign({}, options, { apiKey, env });
  }
}

class SdkService {
  constructor(private readonly _networkMember: Wallet) {}

  get accessToken(): string {
    return this._networkMember.accessToken;
  }

  get did(): string {
    return this._networkMember.did;
  }

  get encryptedSeed(): string {
    return this._networkMember.encryptedSeed;
  }

  get encryptionKey(): string {
    return this._networkMember.password;
  }

  get accessApiKey(): string {
    return (this._networkMember as any)._accessApiKey;
  }

  async createEncryptedMessage(did: any, payload: any): Promise<string> {
    return this._networkMember.createEncryptedMessage(did, payload);
  }

  async readEncryptedMessage(message: string): Promise<any> {
    return this._networkMember.readEncryptedMessage(message);
  }

  async generateCredentialShareRequestToken(
    credentialRequirements: any,
    issuerDid?: string,
    options?: any
  ): Promise<string> {
    return this._networkMember.generateCredentialShareRequestToken(
      credentialRequirements,
      issuerDid,
      options
    );
  }

  async verifyCredentialShareResponseToken(
    credentialShareResponseToken: string,
    credentialShareRequest?: any,
    shouldOwn: boolean = true
  ): Promise<any> {
    return this._networkMember.verifyCredentialShareResponseToken(
      credentialShareResponseToken,
      credentialShareRequest,
      shouldOwn
    );
  }

  async signOut() {
    await this._networkMember.signOut();
  }

  static async fromAccessToken(accessToken: string): Promise<SdkService> {
    const { keyStorageUrl } = SDKConfigurator.getSdkOptions();

    const encryptedSeed = await WalletStorageService.pullEncryptedSeed(
      accessToken,
      keyStorageUrl,
      SDK_OPTIONS
    );
    const encryptionKey = await WalletStorageService.pullEncryptionKey(
      accessToken
    );

    const networkMember = new Wallet(encryptionKey, encryptedSeed, {
      ...SDK_OPTIONS,
      cognitoUserTokens: { accessToken } as any,
    });
    return new SdkService(networkMember);
  }

  static async fromLoginAndPassword(
    username: string,
    password: string
  ): Promise<SdkService> {
    const networkMember = await Wallet.fromLoginAndPassword(
      username,
      password,
      SDK_OPTIONS
    );
    return new SdkService(networkMember);
  }
}

export default SdkService;
