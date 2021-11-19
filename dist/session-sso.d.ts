declare class SessionSSO {
    defaultProvider: keyof SSOProviderMap;
    defaultGenerator: keyof SSOGeneratorMap;
    providerSpecificOptions: {
        [key: string]: unknown;
    };
    constructor({ defaultProvider, defaultGenerator, ...providerSpecificOptions }?: SessionSSOOptions);
    generateSSO: GenerateSSO;
    verifySSO: VerifySSO;
}
export default SessionSSO;
export interface PRIVKeyPromisePayload {
    kid: string;
    pem: string;
}
export interface PUBKeyPromisePayload {
    [k: string]: string;
}
export interface SSOProviderOptions {
    authKey: string;
    retrieveProperties?: string[];
    publicKeyPromise?: Promise<PUBKeyPromisePayload>;
    [key: string]: unknown;
}
export interface SSOPromiseResultSuccess {
    payload: {
        [key: string]: unknown;
    };
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
    [key: string]: unknown;
}
export interface SSOGeneratorOptions {
    authorizationPromise: Promise<AuthorizationPromisePayload> | unknown;
    privateKeyPromise: Promise<PRIVKeyPromisePayload> | unknown;
    [key: string]: unknown;
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
    provider?: keyof SSOProviderMap;
}
export interface VerifySSO {
    (options: SSOVerifyOptions): Promise<SSOPromiseResultSuccess | SSOPromiseResultFail>;
}
export interface SSOGenerateOptions extends SSOGeneratorOptions {
    generator?: keyof SSOGeneratorMap;
}
export interface GenerateSSO {
    (options: SSOGenerateOptions): Promise<SSOPromiseResultSuccess | SSOPromiseResultFail>;
}
export interface SessionSSOOptions extends Partial<SSOProviderOptions> {
    defaultProvider?: keyof SSOProviderMap;
    defaultGenerator?: keyof SSOGeneratorMap;
}
