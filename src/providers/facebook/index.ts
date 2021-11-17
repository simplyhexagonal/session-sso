import axios from 'axios';

import { SSOProvider, } from '../../interfaces';
import SSOUtils from '../../utils';

export default <SSOProvider>((
  {
    appId,
    appSecret,
    authKey: token,
    retrieveProperties = ['email'],
  },
) => {
  return new Promise((resolve, reject) => {
    try {
      if (!(appId && appSecret)) {
        throw new Error('missing dev credentials');
      }

      axios.get(
        `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`
      ).then(SSOUtils.normalizeServerResponse)
      .then(({access_token: apiToken}) => {
        if (!apiToken) {
          throw new Error('unable to fetch access_token');
        }

        axios.get(`https://graph.facebook.com/debug_token?input_token=${token}&access_token=${apiToken}`)
          .then(SSOUtils.normalizeServerResponse)
          .then(({data}) => {
            const {
              is_valid: isValid,
            } = data;

            if (!isValid) {
              throw new Error('token invalid');
            }

            const {
              user_id: userId,
            } = data;

            axios.get(`https://graph.facebook.com/${userId}?fields=id,email&access_token=${token}`)
              .then(SSOUtils.normalizeServerResponse)
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
          }).catch((e) => {
            reject(e.message);
          });
      }).catch((e) => {
        reject(e.message);
      });
    } catch(e: any) {
      reject(e.message);
    }
  }).then((payload) => ({ payload, })).catch(((error) => ({ error, })));
});
