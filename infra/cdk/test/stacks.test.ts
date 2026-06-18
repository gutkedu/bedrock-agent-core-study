import { App, CfnParameter, Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { describe, expect, it } from "vitest";

import { AgentCoreStack } from "../lib/agent-core-stack.js";
import { BackendStack } from "../lib/backend-stack.js";
import { StatefulStack } from "../lib/stateful-stack.js";

describe("StatefulStack", () => {
  it("synthesizes Cognito resources and legacy SAM export names", () => {
    const app = new App();
    const stack = new StatefulStack(app, "TestStatefulStack", {
      appName: "ServerlessHackaton"
    });

    const template = Template.fromStack(stack);

    template.resourceCountIs("AWS::Cognito::UserPool", 1);
    template.resourceCountIs("AWS::Cognito::UserPoolClient", 1);
    template.resourceCountIs("AWS::Cognito::IdentityPool", 1);
    template.resourceCountIs("AWS::Cognito::IdentityPoolRoleAttachment", 1);

    template.hasResourceProperties("AWS::Cognito::UserPool", {
      UserPoolName: "ServerlessHackaton-UserPool",
      AutoVerifiedAttributes: ["email"],
      UsernameAttributes: ["email"],
      MfaConfiguration: "OFF"
    });

    template.hasOutput("UserPoolId", {
      Export: { Name: "StatefulStack-UserPoolId" }
    });
    template.hasOutput("UserPoolArn", {
      Export: { Name: "StatefulStack-UserPoolArn" }
    });
    template.hasOutput("UserPoolClientId", {
      Export: { Name: "StatefulStack-UserPoolClientId" }
    });
    template.hasOutput("IdentityPoolId", {
      Export: { Name: "StatefulStack-IdentityPoolId" }
    });
  });
});

describe("BackendStack", () => {
  it("synthesizes Lambda/API resources with SAM-compatible names and parameters", () => {
    const app = new App();
    const imports = new Stack(app, "BackendImports");
    const stack = new BackendStack(app, "TestBackendStack", {
      appName: "ServerlessHackaton",
      coordinatorAgentUrlDefault: "https://example.test/runtime",
      bearerTokenDefault: "",
      userPool: cognito.UserPool.fromUserPoolId(imports, "ImportedUserPool", "user-pool-id"),
      userPoolClient: cognito.UserPoolClient.fromUserPoolClientId(
        imports,
        "ImportedUserPoolClient",
        "user-pool-client-id"
      )
    });

    const template = Template.fromStack(stack);
    const coordinatorUrl = stack.node.tryFindChild("CoordinatorAgentUrl") as CfnParameter;
    const bearerToken = stack.node.tryFindChild("BearerToken") as CfnParameter;

    expect(coordinatorUrl.default).toBe("https://example.test/runtime");
    expect(bearerToken.noEcho).toBe(true);

    template.hasParameter("CoordinatorAgentUrl", {
      Type: "String",
      Default: "https://example.test/runtime"
    });
    template.hasParameter("BearerToken", {
      Type: "String",
      Default: "",
      NoEcho: true
    });

    template.hasResourceProperties("AWS::Lambda::Function", {
      FunctionName: "TokenAuthorizerFunction",
      Runtime: "nodejs22.x",
      Architectures: ["arm64"],
      MemorySize: 512,
      Timeout: 10
    });
    template.hasResourceProperties("AWS::Lambda::Function", {
      FunctionName: "SigninFunction",
      Runtime: "nodejs22.x",
      Architectures: ["arm64"]
    });
    template.hasResourceProperties("AWS::Lambda::Function", {
      FunctionName: "HelloFunction",
      Runtime: "python3.12",
      Architectures: ["arm64"]
    });
    template.hasResourceProperties("AWS::Lambda::Function", {
      FunctionName: "CoordinatorFunction",
      Runtime: "python3.12",
      Timeout: 300,
      Environment: {
        Variables: {
          COORDINATOR_AGENT_URL: { Ref: "CoordinatorAgentUrl" },
          BEARER_TOKEN: { Ref: "BearerToken" }
        }
      }
    });

    template.hasResourceProperties("AWS::ApiGateway::Stage", {
      StageName: "api"
    });
    template.hasResourceProperties("AWS::ApiGateway::Authorizer", {
      Name: "TokenAuthorizer",
      Type: "TOKEN",
      IdentitySource: "method.request.header.Authorization",
      AuthorizerResultTtlInSeconds: 1800
    });
    template.resourceCountIs("AWS::ApiGateway::Method", 8);

    template.hasOutput("ApiGatewayURL", {
      Export: { Name: "StatelessStack-ApiGatewayURL" }
    });
    template.hasOutput("TokenAuthorizerFunctionArn", {
      Export: { Name: "NodejsStack-TokenAuthorizerFunctionArn" }
    });
    template.hasOutput("CoordinatorFunctionArn", {
      Export: { Name: "PythonStack-CoordinatorFunctionArn" }
    });
  });

});

describe("AgentCoreStack", () => {
  it("synthesizes two AgentCore runtimes backed by Docker image assets", () => {
    const app = new App();
    const imports = new Stack(app, "AgentCoreImports", {
      env: {
        account: "123456789012",
        region: "us-east-1"
      }
    });
    const stack = new AgentCoreStack(app, "TestAgentCoreStack", {
      appName: "ServerlessHackaton",
      envName: "dev",
      env: {
        account: "123456789012",
        region: "us-east-1"
      },
      userPool: cognito.UserPool.fromUserPoolId(imports, "AgentCoreUserPool", "us-east-1_test"),
      userPoolClient: cognito.UserPoolClient.fromUserPoolClientId(
        imports,
        "AgentCoreUserPoolClient",
        "agentcore-client-id"
      )
    });

    const template = Template.fromStack(stack);

    template.resourceCountIs("AWS::BedrockAgentCore::Runtime", 2);
    template.hasResourceProperties("AWS::BedrockAgentCore::Runtime", {
      AgentRuntimeName: "ServerlessHackaton_dev_weather",
      ProtocolConfiguration: "HTTP"
    });
    template.hasResourceProperties("AWS::BedrockAgentCore::Runtime", {
      AgentRuntimeName: "ServerlessHackaton_dev_calculator_a2a",
      ProtocolConfiguration: "A2A",
      EnvironmentVariables: Match.objectLike({
        AGENTCORE_RUNTIME_URL: "http://127.0.0.1:9000/"
      })
    });
    template.hasResourceProperties("AWS::BedrockAgentCore::Runtime", {
      AuthorizerConfiguration: {
        CustomJWTAuthorizer: Match.objectLike({
          AllowedClients: ["agentcore-client-id"]
        })
      }
    });
    template.hasResourceProperties("AWS::BedrockAgentCore::Runtime", {
      AgentRuntimeArtifact: {
        ContainerConfiguration: {
          ContainerUri: Match.anyValue()
        }
      }
    });
    template.hasOutput("WeatherAgentRuntimeArn", {});
    template.hasOutput("CalculatorA2aRuntimeArn", {});
  });
});
