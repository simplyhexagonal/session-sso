import fetch from 'node-fetch';

import { SSOProvider, } from '../interfaces';

export default <SSOProvider>((
  {
    appId,
    appSecret,
    authKey: token,
    retrieveProperties = ['email',],
  },
) => {
  return new Promise((resolve, reject) => {
    try {
      if (!(appId && appSecret)) {
        throw new Error('missing dev credentials');
      }

      fetch(`https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`)
        .then((res) => res.json())
        .then(({access_token: apiToken,}) => {
          if (!apiToken) {
            throw new Error('unable to fetch access_token');
          }

          fetch(`https://graph.facebook.com/debug_token?input_token=${token}&access_token=${apiToken}`)
            .then((res) => res.json())
            .then(({data,}) => {
              const {
                is_valid: isValid,
              } = data;
  
              if (!isValid) {
                throw new Error('token invalid');
              }

              const {
                user_id: userId,
              } = data;

              fetch(`https://graph.facebook.com/${userId}?fields=id,email&access_token=${token}`)
                .then((res) => {return res.json();})
                .then((authPayload) => {
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
                }).catch((e) => {
                  reject(e.message);
                });
            }).catch((e) => {
              reject(e.message);
            });
        }).catch((e) => {
          reject(e.message);
        });
    } catch(e) {
      reject(e.message);
    }
  }).then((payload) => ({ payload, })).catch(((error) => ({ error, })));
});
