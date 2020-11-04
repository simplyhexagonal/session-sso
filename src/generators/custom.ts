import jwt from 'jsonwebtoken';

import {
  SSOGenerator,
  AuthorizationPromisePayload,
} from '../interfaces';

export default <SSOGenerator>((
  {
    authorizationPromise,
    privateKeyPromise,
  }
) => {
  return new Promise((resolve, reject) => {
    try {
      authorizationPromise.then((payload: AuthorizationPromisePayload) => {
        privateKeyPromise.then(({
          kid: keyid,
          pem: privateKey,
        }) => {
          resolve({
            token: jwt.sign(payload, privateKey, { algorithm: 'RS256', keyid, }),
          });
        }).catch((e) => {
          reject(e.message);
        });
      }).catch((e) => {
        reject(e.message);
      });
    } catch (e) {
      reject(e.message);
    }
  }).then((payload) => ({ payload, })).catch(((error) => ({ error, })));
});
