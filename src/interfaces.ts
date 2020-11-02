export interface PEMKeyPromisePayload {
  kid: string;
  pem: string;
}

export interface SSOProviderOptions {
  authKey: string;
  retrieveProperties?: string[];
  publicKeyPromise?: Promise<PEMKeyPromisePayload>;
  [key: string]: any;
}

export interface SSOPromiseResultSuccess {
  payload: { [key: string]: any };
}

export interface SSOPromiseResultFail {
  error: string;
}

export interface SSOProvider {
  (options: SSOProviderOptions): Promise<SSOPromiseResultSuccess | SSOPromiseResultFail>;
}

export interface AuthorizationPromisePayload {
  iss: number;
  exp: number;
  [key: string]: any;
}

export interface SSOGeneratorOptions {
  authorizationPromise: Promise<AuthorizationPromisePayload>;
  privateKeyPromise: Promise<PEMKeyPromisePayload>;
  [key: string]: any;
}

export interface SSOGenerator {
  (options: SSOGeneratorOptions): Promise<SSOPromiseResultSuccess | SSOPromiseResultFail>;
}

export interface SSOProviderMap {
  google: SSOProvider;
  facebook: SSOProvider;
  github: SSOProvider;
  custom: SSOProvider;
}

export interface SSOGeneratorMap {
  custom: SSOGenerator;
}

export interface SSOVerifyOptions extends SSOProviderOptions {
  provider?: keyof SSOProviderMap,
}

export interface VerifySSO {
  (options: SSOVerifyOptions): Promise<SSOPromiseResultSuccess | SSOPromiseResultFail>;
}

export interface SSOGenerateOptions extends SSOGeneratorOptions {
  generator?: keyof SSOGeneratorMap,
}

export interface GenerateSSO {
  (options: SSOGenerateOptions): Promise<SSOPromiseResultSuccess | SSOPromiseResultFail>;
}

export interface SessionSSOOptions extends Partial<SSOProviderOptions> {
  defaultProvider?: keyof SSOProviderMap;
  defaultGenerator?: keyof SSOGeneratorMap;
}
