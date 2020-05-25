import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = `-----BEGIN CERTIFICATE-----
MIIC+TCCAeGgAwIBAgIJYqzJyh9XU6d2MA0GCSqGSIb3DQEBCwUAMBoxGDAWBgNV
BAMTD3JqNDQ1LmF1dGgwLmNvbTAeFw0yMDA1MjQwNTUwMDVaFw0zNDAxMzEwNTUw
MDVaMBoxGDAWBgNVBAMTD3JqNDQ1LmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEB
BQADggEPADCCAQoCggEBAKqnCKraBJJnIjQpHgT/6IE9VCFGKXB1kDkspsbRrezb
QMRhbWSSXM48oZpdcyK0KypXUxbcohmYlU+vAInxW+/4GCJsBroWBocdYeEsjlaM
kLEtBM3sUL1PUsxDHREIFybW2jHzVHqp4rTOtVRYO4t5hYO+XTDFqgQ5SNL91x2u
bo+Rx2miPTdizYM2Nu05Q6qOHYU1uszSYV/+Xb1P2YmruJUTY97Ej6ogjARq9TbY
nPes07ki2njrgWvCi2K+7FlIaXK6Tbr61Twi5KdSbnDponocL/bW0Fhbghy+ykFD
BdMVkZlZuEI3H3MNSpckkUCjUz4GKnPzwaHJvpcJpLkCAwEAAaNCMEAwDwYDVR0T
AQH/BAUwAwEB/zAdBgNVHQ4EFgQUSac5Zjy0UMQUl+zTOKfBfILIkLswDgYDVR0P
AQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQB2yZsP9z7jFvT/XHCRDBCBRnw9
/o8aIf9UJpRdiysrq7fO0Oe4Sjk1wvdpSnb5yG05yYIhCjRUi94GCKhQz0xHWSeN
qExKngubeiNIRMCaR6m27sUWRvvqUdYH+pFAKA5WXB8wLbgmuIbl5LJXkFv1O3b2
0gT+DlhVwALCNQzZ+/E4T79XNMGQKC8QDpHuW8f/rg0RpKWFa8p6sYeF9JZv5PEW
1WallbLSviVNr5UtfW5aubXGcsC1Sh/dDtJFiYdgfGZ1mLxBRI+Rmh60HMk1eo5p
b3M/A89AJGgG+ZOHieo5m1BmXHEjEP7kfwsoIUYu5FOjoPKZWgtzbiQ+/KyM
-----END CERTIFICATE-----`;

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const response = await Axios.get(jwksUrl);
  verify(token, jwksUrl, { algorithms: ['RS256'] });
  const jwt: Jwt = decode(token, { complete: true }) as Jwt;
  return jwt.payload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
