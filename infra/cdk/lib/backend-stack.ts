import { Aws, CfnOutput, CfnParameter, Duration, Stack, StackProps } from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodeLambda from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

import { fromRepoRoot } from "./paths.js";

export interface BackendStackProps extends StackProps {
  readonly appName: string;
  readonly userPool: cognito.IUserPool;
  readonly userPoolClient: cognito.IUserPoolClient;
  readonly coordinatorAgentUrlDefault?: string;
  readonly bearerTokenDefault?: string;
}

const nodeExternalModules = [
  "aws-jwt-verify",
  "@aws-lambda-powertools/logger",
  "zod",
  "@aws-sdk/client-cognito-identity-provider",
  "@aws-lambda-powertools/parser",
  "@middy/core"
];

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const coordinatorAgentUrl = new CfnParameter(this, "CoordinatorAgentUrl", {
      type: "String",
      description: "AgentCore runtime URL for the coordinator agent",
      default: props.coordinatorAgentUrlDefault ?? ""
    });

    const bearerToken = new CfnParameter(this, "BearerToken", {
      type: "String",
      description: "Bearer token for coordinator agent authentication",
      noEcho: true,
      default: props.bearerTokenDefault ?? ""
    });

    const nodeDepsLayer = new lambda.LayerVersion(this, "NodejsDepsLayer", {
      layerVersionName: "NodejsDepsLayer",
      description: "Dependencies for the Nodejs Lambda functions",
      compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
      compatibleArchitectures: [lambda.Architecture.ARM_64],
      code: lambda.Code.fromAsset(fromRepoRoot("backend/nodejs/layers/nodejs-deps"), {
        bundling: {
          image: lambda.Runtime.NODEJS_22_X.bundlingImage,
          ...dockerPlatform(),
          command: [
            "bash",
            "-c",
            "mkdir -p /asset-output/nodejs /tmp/.npm && cp package*.json /asset-output/nodejs/ && cd /asset-output/nodejs && npm_config_cache=/tmp/.npm npm install --omit=dev"
          ]
        }
      })
    });

    const powertoolsLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "PowertoolsTypescriptLayer",
      `arn:aws:lambda:${Aws.REGION}:094274105915:layer:AWSLambdaPowertoolsTypeScriptV2:17`
    );

    const sharedNodeProps = {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 512,
      timeout: Duration.seconds(10),
      layers: [nodeDepsLayer, powertoolsLayer],
      environment: {
        NODE_OPTIONS: "--enable-source-maps",
        USER_POOL_ID: props.userPool.userPoolId,
        USER_POOL_CLIENT_ID: props.userPoolClient.userPoolClientId
      },
      depsLockFilePath: fromRepoRoot("backend/nodejs/package-lock.json"),
      projectRoot: fromRepoRoot("backend/nodejs"),
      bundling: {
        minify: true,
        target: "esnext",
        format: nodeLambda.OutputFormat.ESM,
        sourceMap: true,
        tsconfig: fromRepoRoot("backend/nodejs/tsconfig.json"),
        externalModules: nodeExternalModules
      }
    } satisfies Partial<nodeLambda.NodejsFunctionProps>;

    const tokenAuthorizerFunction = new nodeLambda.NodejsFunction(this, "TokenAuthorizerFunction", {
      ...sharedNodeProps,
      functionName: "TokenAuthorizerFunction",
      description: "Validates JWT tokens from Cognito for API Gateway",
      entry: fromRepoRoot("backend/nodejs/src/lambdas/auth/authorizer.ts"),
      handler: "authorizerHandler"
    });

    const signinFunction = new nodeLambda.NodejsFunction(this, "SigninFunction", {
      ...sharedNodeProps,
      functionName: "SigninFunction",
      description: "Handles user signin requests",
      entry: fromRepoRoot("backend/nodejs/src/lambdas/auth/signin.ts"),
      handler: "signinHandler"
    });

    signinFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["cognito-idp:InitiateAuth"],
        resources: [props.userPool.userPoolArn]
      })
    );

    const helloFunction = new lambda.Function(this, "HelloFunction", {
      functionName: "HelloFunction",
      description: "A simple hello world function for testing",
      runtime: lambda.Runtime.PYTHON_3_12,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 512,
      timeout: Duration.seconds(10),
      handler: "hello.handler",
      code: lambda.Code.fromAsset(fromRepoRoot("backend/python/src/lambdas/hello"))
    });

    const coordinatorFunction = new lambda.Function(this, "CoordinatorFunction", {
      functionName: "CoordinatorFunction",
      description: "Lambda function to communicate with the coordinator agent via A2A",
      runtime: lambda.Runtime.PYTHON_3_12,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 512,
      timeout: Duration.seconds(300),
      handler: "coordinator.handler",
      code: lambda.Code.fromAsset(fromRepoRoot("backend/python/src/lambdas/coordinator"), {
        bundling: {
          image: lambda.Runtime.PYTHON_3_12.bundlingImage,
          ...dockerPlatform(),
          command: [
            "bash",
            "-c",
            "pip install --no-cache-dir -r requirements.txt -t /asset-output && cp -au . /asset-output"
          ]
        }
      }),
      environment: {
        COORDINATOR_AGENT_URL: coordinatorAgentUrl.valueAsString,
        BEARER_TOKEN: bearerToken.valueAsString
      }
    });

    const api = new apigateway.RestApi(this, "ApiGateway", {
      restApiName: `${props.appName}-api`,
      description: "Agent API",
      endpointConfiguration: {
        types: [apigateway.EndpointType.REGIONAL]
      },
      deployOptions: {
        stageName: "api"
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["GET", "POST", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"]
      }
    });

    const signin = api.root.addResource("auth").addResource("signin");
    signin.addMethod("POST", new apigateway.LambdaIntegration(signinFunction));

    const hello = api.root.addResource("hello");
    hello.addMethod("GET", new apigateway.LambdaIntegration(helloFunction));

    const coordinator = api.root.addResource("coordinator");
    coordinator.addMethod("POST", new apigateway.LambdaIntegration(coordinatorFunction));

    const authorizer = new apigateway.CfnAuthorizer(this, "TokenAuthorizer", {
      name: "TokenAuthorizer",
      restApiId: api.restApiId,
      type: "TOKEN",
      identitySource: "method.request.header.Authorization",
      authorizerResultTtlInSeconds: 1800,
      authorizerUri: `arn:${Aws.PARTITION}:apigateway:${Aws.REGION}:lambda:path/2015-03-31/functions/${tokenAuthorizerFunction.functionArn}/invocations`
    });

    new lambda.CfnPermission(this, "TokenAuthorizerInvokePermission", {
      functionName: tokenAuthorizerFunction.functionArn,
      action: "lambda:InvokeFunction",
      principal: "apigateway.amazonaws.com",
      sourceArn: `arn:${Aws.PARTITION}:execute-api:${Aws.REGION}:${Aws.ACCOUNT_ID}:${api.restApiId}/*/*/*`
    }).node.addDependency(authorizer);

    new CfnOutput(this, "ApiGatewayURL", {
      description: "URL for the API Gateway",
      value: api.url,
      exportName: "StatelessStack-ApiGatewayURL"
    });

    new CfnOutput(this, "TokenAuthorizerFunctionArn", {
      description: "ARN of the Token Authorizer Lambda Function",
      value: tokenAuthorizerFunction.functionArn,
      exportName: "NodejsStack-TokenAuthorizerFunctionArn"
    });

    new CfnOutput(this, "SigninFunctionArn", {
      description: "ARN of the Signin Lambda Function",
      value: signinFunction.functionArn,
      exportName: "NodejsStack-SigninFunctionArn"
    });

    new CfnOutput(this, "HelloFunctionArn", {
      description: "ARN of the Hello Lambda Function",
      value: helloFunction.functionArn,
      exportName: "PythonStack-HelloFunctionArn"
    });

    new CfnOutput(this, "CoordinatorFunctionArn", {
      description: "ARN of the Coordinator Lambda Function",
      value: coordinatorFunction.functionArn,
      exportName: "PythonStack-CoordinatorFunctionArn"
    });
  }
}

function dockerPlatform(): { readonly platform?: string } {
  return { platform: process.env.CDK_BUNDLE_PLATFORM ?? "linux/amd64" };
}
