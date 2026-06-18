import { App, Environment } from "aws-cdk-lib";

export interface HarnessConfig {
  readonly appName: string;
  readonly envName: string;
  readonly coordinatorAgentUrlDefault: string;
  readonly bearerTokenDefault: string;
  readonly env: Environment;
}

function readString(app: App, key: string, defaultValue: string): string {
  const value = app.node.tryGetContext(key);
  if (typeof value === "string") {
    return value;
  }

  return defaultValue;
}

export function loadHarnessConfig(app: App): HarnessConfig {
  const region = readString(app, "region", process.env.CDK_DEFAULT_REGION ?? "us-east-1");
  const account = readString(app, "account", process.env.CDK_DEFAULT_ACCOUNT ?? "");

  return {
    appName: readString(app, "appName", "ServerlessHackaton"),
    envName: readString(app, "envName", "dev"),
    coordinatorAgentUrlDefault: readString(app, "coordinatorAgentUrl", ""),
    bearerTokenDefault: readString(app, "bearerToken", ""),
    env: {
      account: account === "" ? undefined : account,
      region
    }
  };
}
