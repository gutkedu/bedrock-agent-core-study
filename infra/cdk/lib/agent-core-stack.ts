import { Aws, CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import * as agentcore from "aws-cdk-lib/aws-bedrockagentcore";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as ecrAssets from "aws-cdk-lib/aws-ecr-assets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

import { fromRepoRoot } from "./paths.js";

export interface AgentCoreStackProps extends StackProps {
  readonly appName: string;
  readonly envName: string;
  readonly userPool?: cognito.IUserPool;
  readonly userPoolClient?: cognito.IUserPoolClient;
}

export class AgentCoreStack extends Stack {
  readonly weatherRuntime: agentcore.Runtime;
  readonly calculatorA2aRuntime: agentcore.Runtime;

  constructor(scope: Construct, id: string, props: AgentCoreStackProps) {
    super(scope, id, props);

    this.weatherRuntime = this.createRuntime("WeatherAgentRuntime", {
      runtimeName: runtimeName(props.appName, props.envName, "weather"),
      description: "Weather assistant AgentCore HTTP runtime",
      protocol: agentcore.ProtocolType.HTTP,
      dockerDirectory: fromRepoRoot("agentcore/agents/weather_agent"),
      userPool: props.userPool,
      userPoolClient: props.userPoolClient
    });

    this.calculatorA2aRuntime = this.createRuntime("CalculatorA2aRuntime", {
      runtimeName: runtimeName(props.appName, props.envName, "calculator_a2a"),
      description: "Calculator assistant AgentCore A2A runtime",
      protocol: agentcore.ProtocolType.A2A,
      dockerDirectory: fromRepoRoot("agentcore/agents/calculator_agent_a2a"),
      userPool: props.userPool,
      userPoolClient: props.userPoolClient,
      environmentVariables: {
        AGENTCORE_RUNTIME_URL: "http://127.0.0.1:9000/"
      }
    });

    new CfnOutput(this, "WeatherAgentRuntimeArn", {
      description: "ARN of the weather AgentCore runtime",
      value: this.weatherRuntime.agentRuntimeArn
    });

    new CfnOutput(this, "WeatherAgentRuntimeId", {
      description: "ID of the weather AgentCore runtime",
      value: this.weatherRuntime.agentRuntimeId
    });

    new CfnOutput(this, "WeatherAgentRuntimeInvocationUrlHint", {
      description: "Invocation URL template; URL-encode the runtime ARN before direct HTTPS use",
      value: `https://bedrock-agentcore.${Aws.REGION}.${Aws.URL_SUFFIX}/runtimes/${this.weatherRuntime.agentRuntimeArn}/invocations`
    });

    new CfnOutput(this, "CalculatorA2aRuntimeArn", {
      description: "ARN of the calculator A2A AgentCore runtime",
      value: this.calculatorA2aRuntime.agentRuntimeArn
    });

    new CfnOutput(this, "CalculatorA2aRuntimeId", {
      description: "ID of the calculator A2A AgentCore runtime",
      value: this.calculatorA2aRuntime.agentRuntimeId
    });

    new CfnOutput(this, "CalculatorA2aRuntimeInvocationUrlHint", {
      description: "Invocation URL template; URL-encode the runtime ARN before direct HTTPS use",
      value: `https://bedrock-agentcore.${Aws.REGION}.${Aws.URL_SUFFIX}/runtimes/${this.calculatorA2aRuntime.agentRuntimeArn}/invocations`
    });
  }

  private createRuntime(id: string, options: CreateRuntimeOptions): agentcore.Runtime {
    const applicationLogs = new logs.LogGroup(this, `${id}ApplicationLogs`, {
      logGroupName: `/aws/bedrock-agentcore/cdk/${options.runtimeName}/application`,
      retention: logs.RetentionDays.ONE_MONTH
    });

    const usageLogs = new logs.LogGroup(this, `${id}UsageLogs`, {
      logGroupName: `/aws/bedrock-agentcore/cdk/${options.runtimeName}/usage`,
      retention: logs.RetentionDays.ONE_MONTH
    });

    const runtime = new agentcore.Runtime(this, id, {
      runtimeName: options.runtimeName,
      description: options.description,
      protocolConfiguration: options.protocol,
      agentRuntimeArtifact: agentcore.AgentRuntimeArtifact.fromAsset(options.dockerDirectory, {
        platform: ecrAssets.Platform.LINUX_ARM64
      }),
      authorizerConfiguration:
        options.userPool && options.userPoolClient
          ? agentcore.RuntimeAuthorizerConfiguration.usingCognito(options.userPool, [options.userPoolClient])
          : agentcore.RuntimeAuthorizerConfiguration.usingIAM(),
      environmentVariables: options.environmentVariables,
      requestHeaderConfiguration: {
        allowlistedHeaders: [
          "Authorization",
          "X-Amzn-Bedrock-AgentCore-Runtime-Session-Id",
          "X-Amzn-Bedrock-AgentCore-Runtime-User-Id"
        ]
      },
      tracingEnabled: true,
      loggingConfigs: [
        {
          logType: agentcore.LogType.APPLICATION_LOGS,
          destination: agentcore.LoggingDestination.cloudWatchLogs(applicationLogs)
        },
        {
          logType: agentcore.LogType.USAGE_LOGS,
          destination: agentcore.LoggingDestination.cloudWatchLogs(usageLogs)
        }
      ],
      tags: {
        app: "bedrock-agent-core-study"
      }
    });

    runtime.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
        resources: ["*"]
      })
    );

    return runtime;
  }
}

interface CreateRuntimeOptions {
  readonly runtimeName: string;
  readonly description: string;
  readonly protocol: agentcore.ProtocolType;
  readonly dockerDirectory: string;
  readonly userPool?: cognito.IUserPool;
  readonly userPoolClient?: cognito.IUserPoolClient;
  readonly environmentVariables?: Record<string, string>;
}

function runtimeName(appName: string, envName: string, suffix: string): string {
  const normalized = `${appName}_${envName}_${suffix}`.replace(/[^A-Za-z0-9_]/g, "_");
  const prefixed = /^[A-Za-z]/.test(normalized) ? normalized : `A_${normalized}`;
  return prefixed.slice(0, 48);
}
