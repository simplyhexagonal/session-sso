import jwt, {
  Jwt,
  JwtPayload,
} from 'jsonwebtoken';
import axios from 'axios';
import { SSOProvider, } from '../../interfaces';
import SSOUtils from '../../utils';

export default <SSOProvider>((
  {
    authKey: token,
    retrieveProperties = ['email'],
  },
) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        header: {
          kid,
        },
      } = jwt.decode(token, { complete: true, }) as Jwt;

      axios.get('https://www.googleapis.com/oauth2/v1/certs')
        .then(SSOUtils.normalizeServerResponse)
        .then((certs: {[k: string]: string}) => {
          const authPayload: JwtPayload = jwt.verify(token, certs[kid as string], { algorithms: ['RS256',], }) as JwtPayload;

          if (!retrieveProperties.reduce((a, b) => a && Object.keys(authPayload).includes(b), true)) {
            throw new Error('properties missing in auth payload');
          }

          const payload: { [key: string]: { [key: string]: unknown } } = retrieveProperties.reduce(
            (a, b) => {
              a[b] = authPayload[b];
              return a;
            },
            {} as {[k: string]: { [key: string]: unknown }},
          );

          resolve(payload);
        })
        .catch((e) => {
          reject(e.message);
        });
    } catch (e: any) {
      reject(e.message);
    }
  }).then((payload) => ({ payload, })).catch(((error) => ({ error, })));
});
