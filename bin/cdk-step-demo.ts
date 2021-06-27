#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkStepDemoStack } from '../lib/cdk-step-demo-stack';
const stage = process.env.ENVIRONMENT || 'dev'
const app = new cdk.App();
// const stackProps = app.node.tryGetContext('stackProps')
// const appConfig = stackProps[stage]

new CdkStepDemoStack(app, 'CdkStepDemoStack', { 
  stage,
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
  },
});
