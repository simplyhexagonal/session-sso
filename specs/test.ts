import assert from 'assert';
import SessionSSO, {
  PEMKeyPromisePayload,
  SSOPromiseResultFail,
  SSOPromiseResultSuccess,
} from 'session-sso';
import fetch from 'node-fetch';

const {
  GOOGLE_TOKEN,
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  FACEBOOK_TOKEN,
  GITHUB_APP_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CODE,
  CUSTOM_PRIVATE_CERTS_URL,
  CUSTOM_PUBLIC_CERTS_URL,
  CUSTOM_CERT_URL_TOKEN,
} = process.env;

const testThirdPartyProviders = (
  GOOGLE_TOKEN
  && FACEBOOK_APP_ID
  && FACEBOOK_APP_SECRET
  && FACEBOOK_TOKEN
  && GITHUB_APP_ID
  && GITHUB_CLIENT_SECRET
  && GITHUB_CODE
);

const sso = new SessionSSO({
  // facebook dev credentials
  appId: FACEBOOK_APP_ID || '',
  appSecret: FACEBOOK_APP_SECRET || '',
  // github dev credentials
  clientId: GITHUB_APP_ID || '',
  clientSecret: GITHUB_CLIENT_SECRET || '',
});

(async () => {
  const authorizationPromise = Promise.resolve({
    iss: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    email: 'user-email-address@gmail.com',
  });

  const privateKeyPromise: Promise<PEMKeyPromisePayload> = fetch(
    CUSTOM_PRIVATE_CERTS_URL || 'https://your.static.website/certs.priv.json',
    {
      headers: {
        // pro-tip: you can use "aws:Referer" in S3 bucket policy to restrict access to files by
        // sending a token via the HTTP Referer Header ;)
        // https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html#example-bucket-policies-use-case-4
        'Referer': CUSTOM_CERT_URL_TOKEN,
      },
    },
  ).then((res) => res.json()).then((jpems) => {
    const randomKeyId = Object.keys(jpems).sort(() => Math.random() - 0.5)[0];

    return {
      kid: randomKeyId,
      pem: jpems[randomKeyId],
    };
  });

  const ssoGenResult = await sso.generateSSO({
    authorizationPromise,
    privateKeyPromise,
  });

  if ((ssoGenResult as SSOPromiseResultFail).error) {
    throw new Error((ssoGenResult as SSOPromiseResultFail).error);
  }

  const {
    payload: {
      token,
    },
  } = ssoGenResult as SSOPromiseResultSuccess;

  const publicKeyPromise: Promise<PEMKeyPromisePayload> = fetch(
    CUSTOM_PUBLIC_CERTS_URL || 'https://your.static.website/certs.json',
    {
      headers: {
        // you can use "aws:Referer" in S3 bucket policy to restrict access to files ;)
        // https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html#example-bucket-policies-use-case-4
        'Referer': CUSTOM_CERT_URL_TOKEN,
      },
    },
  ).then((res) => res.json());

  const verifyCustomResult = await sso.verifySSO({
    publicKeyPromise,
    authKey: token as string,
  });

  const results = [];

  results.push(verifyCustomResult);

  if (testThirdPartyProviders) {
    const verifyGoogleResult = await sso.verifySSO({
      provider: 'google',
      authKey: GOOGLE_TOKEN, // token returned by `googleUser.getAuthResponse().id_token`
    });

    const verifyFacebookResult = await sso.verifySSO({
      provider: 'facebook',
      authKey: FACEBOOK_TOKEN, // token returned by `FB.getLoginStatus()` => `response.authResponse.accessToken`
    });

    const verifyGithubResult = await sso.verifySSO({
      provider: 'github',
      authKey: GITHUB_CODE, // auth code placed in url when redirected back from https://github.com/login/oauth/authorize
    });

    results.push(verifyGoogleResult);
    results.push(verifyFacebookResult);
    results.push(verifyGithubResult);
  }

  console.log('results:', results);

  // check all results include the 'email' in the 'payload'
  assert(
    results.reduce(
      (a, b) => (
        a
        && 'payload' in b
        && 'email' in b.payload
      ),
      true,
    ),
  );
})();
