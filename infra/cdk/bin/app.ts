#!/usr/bin/env node
import "source-map-support/register.js";

import { App } from "aws-cdk-lib";

import { AgentCoreStack } from "../lib/agent-core-stack.js";
import { BackendStack } from "../lib/backend-stack.js";
import { loadHarnessConfig } from "../lib/config.js";
import { StatefulStack } from "../lib/stateful-stack.js";

const app = new App();
const config = loadHarnessConfig(app);

const stateful = new StatefulStack(app, `${config.envName}-AgentCoreStatefulStack`, {
  appName: config.appName,
  env: config.env
});

new BackendStack(app, `${config.envName}-AgentCoreBackendStack`, {
  appName: config.appName,
  env: config.env,
  userPool: stateful.userPool,
  userPoolClient: stateful.userPoolClient,
  coordinatorAgentUrlDefault: config.coordinatorAgentUrlDefault,
  bearerTokenDefault: config.bearerTokenDefault
});

new AgentCoreStack(app, `${config.envName}-AgentCoreRuntimeStack`, {
  appName: config.appName,
  envName: config.envName,
  env: config.env,
  userPool: stateful.userPool,
  userPoolClient: stateful.userPoolClient
});
