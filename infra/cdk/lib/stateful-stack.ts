import { CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface StatefulStackProps extends StackProps {
  readonly appName: string;
}

export class StatefulStack extends Stack {
  readonly userPool: cognito.UserPool;
  readonly userPoolClient: cognito.UserPoolClient;
  readonly identityPool: cognito.CfnIdentityPool;

  constructor(scope: Construct, id: string, props: StatefulStackProps) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: `${props.appName}-UserPool`,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true
      },
      autoVerify: {
        email: true
      },
      standardAttributes: {
        email: {
          mutable: false,
          required: true
        }
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: false,
        requireUppercase: true
      },
      userVerification: {
        emailSubject: `${props.appName} - Your verification code`,
        emailBody: "Your verification code is {####}"
      },
      mfa: cognito.Mfa.OFF,
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY
    });

    this.userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool: this.userPool,
      userPoolClientName: `${props.appName}-UserPoolClient`,
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true
      },
      preventUserExistenceErrors: true,
      accessTokenValidity: Duration.minutes(30),
      idTokenValidity: Duration.minutes(30),
      refreshTokenValidity: Duration.days(1)
    });

    this.identityPool = new cognito.CfnIdentityPool(this, "IdentityPool", {
      identityPoolName: `${props.appName}IdentityPool`,
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: this.userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName
        }
      ]
    });

    const authenticatedRole = new iam.Role(this, "AuthenticatedRole", {
      assumedBy: new iam.FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          StringEquals: {
            "cognito-identity.amazonaws.com:aud": this.identityPool.ref
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "authenticated"
          }
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess")]
    });

    new cognito.CfnIdentityPoolRoleAttachment(this, "IdentityPoolRoleAttachment", {
      identityPoolId: this.identityPool.ref,
      roles: {
        authenticated: authenticatedRole.roleArn
      }
    });

    new CfnOutput(this, "UserPoolId", {
      description: "ID of the Cognito User Pool",
      value: this.userPool.userPoolId,
      exportName: "StatefulStack-UserPoolId"
    });

    new CfnOutput(this, "UserPoolArn", {
      description: "ARN of the Cognito User Pool",
      value: this.userPool.userPoolArn,
      exportName: "StatefulStack-UserPoolArn"
    });

    new CfnOutput(this, "UserPoolClientId", {
      description: "ID of the Cognito User Pool Client",
      value: this.userPoolClient.userPoolClientId,
      exportName: "StatefulStack-UserPoolClientId"
    });

    new CfnOutput(this, "IdentityPoolId", {
      description: "ID of the Cognito Identity Pool",
      value: this.identityPool.ref,
      exportName: "StatefulStack-IdentityPoolId"
    });
  }
}
