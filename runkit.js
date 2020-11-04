const assert = require('assert');
const SessionSSO = require('session-sso');
const fetch = require('node-fetch');

const {
  CUSTOM_PRIVATE_CERTS_URL,
  CUSTOM_PUBLIC_CERTS_URL,
  CUSTOM_CERT_URL_TOKEN,
} = process.env;

const customPrivateCertsUrl = CUSTOM_PRIVATE_CERTS_URL;
const customPublicCertsUrl = CUSTOM_PUBLIC_CERTS_URL;
const customCertUrlToken = CUSTOM_CERT_URL_TOKEN;

const sso = new SessionSSO();

(async () => {
  const authorizationPromise = Promise.resolve({
    iss: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    email: 'user-email-address@gmail.com',
  });

  const privateKeyPromise = fetch(
    customPrivateCertsUrl || 'https://your.static.website/certs.priv.json',
    // the following is here for illustrative purposes, comment it out if needed
    {
      headers: {
        // pro-tip: you can use "aws:Referer" in S3 bucket policy to restrict access to files by
        // sending a token via the HTTP Referer Header ;)
        // https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html#example-bucket-policies-use-case-4
        'Referer': customCertUrlToken || 'WXtPUQSIc4Rp1fMOjhcRnqFR',
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

  if (ssoGenResult.error) {
    throw new Error(ssoGenResult.error);
  }

  const {
    payload: {
      token,
    },
  } = ssoGenResult;

  const publicKeyPromise = fetch(
    customPublicCertsUrl || 'https://your.static.website/certs.json',
    // the following is here for illustrative purposes, comment it out if needed
    {
      headers: {
        // you can use "aws:Referer" in S3 bucket policy to restrict access to files ;)
        // https://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html#example-bucket-policies-use-case-4
        'Referer': customCertUrlToken || 'WXtPUQSIc4Rp1fMOjhcRnqFR',
      },
    },
  ).then((res) => res.json());

  const verifyCustomResult = await sso.verifySSO({
    publicKeyPromise,
    authKey: token,
  });

  console.log(verifyCustomResult);
  assert(
    'payload' in verifyCustomResult
    && 'email' in verifyCustomResult.payload
  );
})()
.catch((e) => { throw e; });
