import googleProvider from './providers/google';
import facebookProvider from './providers/facebook';
import githubProvider from './providers/github';
import customProvider from './providers/custom';

import customGenerator from './generators/custom';

import {
  SSOProviderMap,
  SSOGeneratorMap,
  SessionSSOOptions,
  GenerateSSO,
  VerifySSO,
  SSOGenerator,
  SSOProvider,
} from './interfaces';

// @ts-ignore
export { version } from '../package.json';

const ssoProviders: Partial<SSOProviderMap> = {
  google: googleProvider,
  facebook: facebookProvider,
  github: githubProvider,
  custom: customProvider,
};

const ssoGenerators: Partial<SSOGeneratorMap> = {
  custom: customGenerator,
};

class SessionSSO {
  defaultProvider: keyof SSOProviderMap;
  defaultGenerator: keyof SSOGeneratorMap;
  providerSpecificOptions: { [key: string]: unknown };

  constructor(
    {
      defaultProvider,
      defaultGenerator,
      ...providerSpecificOptions
    }: SessionSSOOptions = {},
  ) {
    this.defaultProvider = defaultProvider || 'custom';
    this.defaultGenerator = defaultGenerator || 'custom';
    this.providerSpecificOptions = providerSpecificOptions;
  }

  generateSSO = <GenerateSSO>(async (
    {
      generator = this.defaultGenerator,
      authorizationPromise,
      privateKeyPromise,
    }
  ) => {
    if (generator === 'custom' && !(authorizationPromise && privateKeyPromise)) {
      throw new Error('cannot perform custom sso without auth and private key promises');
    }

    return (ssoGenerators[generator] as SSOGenerator)({
      authorizationPromise,
      privateKeyPromise,
    });
  });

  verifySSO = <VerifySSO>(async (
    {
      provider = this.defaultProvider,
      authKey,
      retrieveProperties,
      ...providerSpecificOptions
    },
  ) => {
    if (provider === 'custom' && !providerSpecificOptions.publicKeyPromise) {
      throw new Error('cannot perform custom sso without a public key');
    }

    return await (ssoProviders[provider] as SSOProvider)({
      authKey,
      retrieveProperties,
      ...this.providerSpecificOptions,
      ...providerSpecificOptions,
    });
  });
}

export default SessionSSO;
