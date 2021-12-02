import jwt from 'jsonwebtoken';

import {
  SSOGenerator,
  AuthorizationPromisePayload,
  PRIVKeyPromisePayload,
} from '../../interfaces';

export default <SSOGenerator>((
  {
    authorizationPromise,
    privateKeyPromise,
  }
) => {
  return new Promise((resolve, reject) => {
    try {
      (authorizationPromise as Promise<AuthorizationPromisePayload>).then(
        (payload: AuthorizationPromisePayload) => {
          (privateKeyPromise as Promise<PRIVKeyPromisePayload>).then(({
            kid,
            pem: privateKey,
          }) => {
            resolve({
              token: jwt.sign(payload, privateKey, { algorithm: 'RS256', header: { alg: 'RS256', kid }, }),
            });
          }).catch((e: any) => {
            reject(e.message);
          });
        }
      ).catch((e: any) => {
        reject(e.message);
      });
    } catch (e: any) {
      reject(e.message);
    }
  }).then((payload) => ({ payload, })).catch(((error) => ({ error, })));
});
