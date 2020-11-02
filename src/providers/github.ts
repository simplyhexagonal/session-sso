import fetch from 'node-fetch';

import { SSOProvider } from '../interfaces';

export default <SSOProvider>((
  {
    clientId,
    clientSecret,
    authKey: code,
    retrieveProperties = ['email'],
  },
) => {
  return new Promise((resolve, reject) => {
    try {
      if (!(clientId && clientSecret)) {
        throw new Error('missing dev credentials');
      }

      fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
          }),
        },
      )
      .then((res) => res.json())
      .then(({access_token: apiToken}) => {
        if (!apiToken) {
          throw new Error('code invalid');
        }

        fetch(
          'https://api.github.com/user',
          {
            headers: {
              'Authorization': `token ${apiToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          }
        ).then((res) => res.json())
          .then((authPayload) => {
            if (!retrieveProperties.reduce((a, b) => a && Object.keys(authPayload).includes(b), true)) {
              throw new Error('properties missing in auth payload');
            }
            
            const payload: { [key: string]: any } = retrieveProperties.reduce((a, b) => a[b] = authPayload[b], {});
            
            resolve(payload);
          }).catch((e) => {
            reject(e.message);
          });
      })
      .catch((e) => {
        reject(e.message);
      });
    } catch (e) {
      reject(e.message);
    }
  }).then((payload) => ({ payload })).catch(((error) => ({ error })));
});
