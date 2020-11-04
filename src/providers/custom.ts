import jwt from 'jsonwebtoken';

import { SSOProvider, } from '../interfaces';

export default <SSOProvider>((
  {
    publicKeyPromise,
    authKey: token,
    retrieveProperties = ['email',],
  },
) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        header: {
          kid,
        },
      } = jwt.decode(token, { complete: true, }) as {[key: string]: {[key: string]: unknown}};

      publicKeyPromise
        .then((jpems) => {
          const authPayload = jwt.verify(token, jpems[kid as string], { algorithms: ['RS256',], });

          if (!retrieveProperties.reduce((a, b) => a && Object.keys(authPayload).includes(b), true)) {
            throw new Error('properties missing in auth payload');
          }

          const payload: { [key: string]: { [key: string]: unknown } } = retrieveProperties.reduce(
            (a, b) => {
              a[b] = authPayload[b];
              return a;
            },
            {},
          );

          resolve(payload);
        })
        .catch((e) => {
          reject(e.message);
        });
    } catch (e) {
      reject(e.message);
    }
  }).then((payload) => ({ payload, })).catch(((error) => ({ error, })));
});
