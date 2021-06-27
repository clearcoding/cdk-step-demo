import { EventBus, Rule } from '@aws-cdk/aws-events';
import { Context, CustomState, IChainable, StateMachine, Wait, WaitTime } from '@aws-cdk/aws-stepfunctions';
import * as cdk from '@aws-cdk/core';
import * as targets from '@aws-cdk/aws-events-targets';

export interface ICdkStepDemoProps extends cdk.StackProps {
  stage: string
}

export class CdkStepDemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: ICdkStepDemoProps) {
    super(scope, id, props);


    const sendEventJson = {
      Type: "Task",
      Resource: 'arn:aws:states:::events:putEvents',
      Parameters:
        { Entries: [{ Detail: { Message: 'Hello from Step Functions!',TaskToken: Context.taskToken, }, DetailType: 'DemoStarted', EventBusName: `${props?.stage}-cdk-step-demo`, Source: `${this.stackId}` }] }
    }

    const sendEvent = new CustomState(this, "send Event", { stateJson: sendEventJson })


    const waitEventJson =  {
      Type: "Task",
      Resource: 'arn:aws:states:::events:putEvents.waitForTaskToken',
      Parameters:
        { Entries: [{ Detail: { Message: 'Hello from Step Functions!' ,"taskToken":'$$.Task.Token'}, DetailType: 'DemoStarted', EventBusName: `${props?.stage}-cdk-step-demo`, Source: `${this.stackId}` }] }
    }
    const waitEvent = new CustomState(this, "wait Event", { stateJson: waitEventJson })

    const wait = new Wait(this, 'Wait Until', {
      time: WaitTime.secondsPath('$.detail.waitSeconds'),
    }).next(sendEvent);

    const stateMachine = new StateMachine(this, 'CDKStepDemoStateMachine', {
      definition: wait,
      tracingEnabled: true
    });

    const bus = new EventBus(this, 'CDKStepDemoEventBus', {
      eventBusName: `${props?.stage}-cdk-step-demo`
    });

    const cdkStepDemoEventsRule = new Rule(this, 'CDKStepDemoEventsBusRule', {
      ruleName: `${props?.stage}-cdk-step-demo-events-rule`,
      description: 'Rule matching demo events',
      eventBus: bus,
      eventPattern: {
        detailType: ['DemoRequested']
      }
    });

    cdkStepDemoEventsRule.addTarget(new targets.SfnStateMachine(stateMachine));
    bus.grantPutEventsTo(stateMachine)

  }
}
