# Single Sign On (SSO) Anti-forge Authentication Strategy

When we get started implementing third-party authentication on our web apps, it's common to
visualize the process as three simple steps:

1. Our user-facing app or API sends a request to an SSO provider (in this example via a "Sign in
with Google" button sending a request to Google's SSO portal)
2. The provider verifies our user's identity
3. We get a token and use that from now on to give access to our user

![Image of your web app sending a request to a Google Sign in form and receiving back a token](https://assets.jeanlescure.io/x48nxLE.png)

The problem with the previous flow is that we are making a **dangerous assumption**: _that the user
contacted our SSO provider without any intervention along the way._

There is a common [man-in-the-middle](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) attack where a nefarious actor will try to impersonate our SSO provider
and send back a perfectly valid token:

![Image of your web app sending a request to a nefarious actor and receiving back a token](https://assets.jeanlescure.io/82lxBlTJ.png)

The attack is successful if we assume the token is safe, since the impersonator keeps a copy which
they can now use to impersonate our user and extract their precious data:

![Image of a nefarious actor using a copy of the fake token to steal user data from your web app](https://assets.jeanlescure.io/dSg0Bpd.png)

This is where our SSO provider and ourselves have a responsibility to take an extra step and verify
that our user got an authentic token.

Our provider does this by supplying a secondary verification method, in the case of Google SSO they
add a public key id to the token which we can then use to verify said token against the correct
key from a collection of keys that they publish on a server of their own.

It is then our responsibility to have our user-facing app programmed to send our API the token they
received from the unverified SSO provider.

We do this to remove the token from a potentially
compromised environment (i.e. a coffee-shop wifi network with a spoofed Google Sign in page).

Once our API receives the token, then it validates said token against the secondary verification
method given by our SSO provider:

![Image of your web app sending a request to an unknown SSO provider and receiving back a token which then gets sent to your API where it is validated against Google's public keys on the cloud](https://assets.jeanlescure.io/1f44oUag.png)

Finally, since we have verified our user and SSO provider's identities separately, it is best
practice to generate our own access token, then send this fully custom token to our web app in order for our user to safely carry on forward:

![Image of your web app sending a request to an unknown SSO provider and receiving back a token which then gets sent to your API where it is successfully validated against Google's public keys on the cloud and thus your API sends a custom token to your web app making the user happy](https://assets.jeanlescure.io/PRr53EM.png)

## This is where the session-sso npm module comes in to play

With the previous strategy in mind, I developed `session-sso` to make it easy for you to implement
the secondary verification step in your API, using your choice of Google, Facebook, and Github as
SSO providers:

![Image placing emphasis on the example of your API performing the secondary verification against Google's public keys on the cloud, which is where you should use session-sso](https://assets.jeanlescure.io/8AXpFOFr.png)

Session SSO also lets you easily implement both the first and second verification steps on your
back-end so that you too can become an SSO provider if you so desire.

For more details be sure to take a look at the module's [README.md](https://github.com/jeanlescure/session-sso/README.md) documentation.
