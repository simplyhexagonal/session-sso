import SessionSSO, { PEMKeyPromisePayload, SSOPromiseResultFail, SSOPromiseResultSuccess } from 'session-sso';
import fetch from 'node-fetch';

const sso = new SessionSSO({
  // facebook dev credentials
  appId: '',
  appSecret: '',
  // github dev credentials
  clientId: '',
  clientSecret: '',
});

(async () => {
  const authorizationPromise = Promise.resolve({
    iss: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    email: 'user-email-address@gmail.com',
  });

  const privateKeyPromise: Promise<PEMKeyPromisePayload> = fetch(
    'https://your.static.website/certs.priv.json',
    {
      headers: {
        // pro-tip: you can use "aws:Referer" in S3 bucket policy to restrict access to files by
        // sending a token via the HTTP Referer Header ;)
        // https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html#example-bucket-policies-use-case-4
        'Referer': 'WXtPUQSIc4Rp1fMOjhcRnqFR',
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
    'https://your.static.website/certs.json',
    {
      headers: {
        // you can use "aws:Referer" in S3 bucket policy to restrict access to files ;)
        // https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html#example-bucket-policies-use-case-4
        'Referer': 'WXtPUQSIc4Rp1fMOjhcRnqFR',
      },
    },
  ).then((res) => res.json());

  const verifyCustomResult = await sso.verifySSO({
    publicKeyPromise,
    authKey: token as string,
  });

  // const verifyGoogleResult = await sso.verifySSO({
  //   provider: 'google',
  //   authKey: '', // token returned by `googleUser.getAuthResponse().id_token`
  // });

  // const verifyFacebookResult = await sso.verifySSO({
  //   provider: 'facebook',
  //   authKey: '', // token returned by `FB.getLoginStatus()` => `response.authResponse.accessToken`
  // });

  // const verifyGithubResult = await sso.verifySSO({
  //   provider: 'github',
  //   authKey: '', // auth code placed in url when redirected back from https://github.com/login/oauth/authorize
  // });

  console.log(verifyCustomResult);
  // console.log(verifyGoogleResult);
  // console.log(verifyFacebookResult);
  // console.log(verifyGithubResult);
})();
