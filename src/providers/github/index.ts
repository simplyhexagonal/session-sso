import axios from 'axios';

import { SSOProvider, } from '../../interfaces';
import SSOUtils from '../../utils';

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

      axios(
        {
          url: 'https://github.com/login/oauth/access_token',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          data: {
            client_id: clientId,
            client_secret: clientSecret,
            code,
          },
        },
      ).then(SSOUtils.normalizeServerResponse)
      .then(({access_token: apiToken}) => {
        if (!apiToken) {
          throw new Error('code invalid');
        }

        axios.get(
          'https://api.github.com/user',
          {
            headers: {
              'Authorization': `token ${apiToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        ).then(SSOUtils.normalizeServerResponse)
        .then((authPayload) => {
          if (!retrieveProperties.reduce((a, b) => a && Object.keys(authPayload).includes(b), true)) {
            throw new Error('properties missing in auth payload');
          }

          const payload: { [key: string]: { [key: string]: unknown } } = retrieveProperties.reduce(
            (a, b) => {
              a[b] = authPayload[b];
              return a;
            },
            {} as { [key: string]: { [key: string]: unknown } },
          );

          resolve(payload);
        }).catch((e) => {
          reject(e.message);
        });
      })
      .catch((e) => {
        reject(e.message);
      });
    } catch (e: any) {
      reject(e.message);
    }
  }).then((payload) => ({ payload, })).catch(((error) => ({ error, })));
});
