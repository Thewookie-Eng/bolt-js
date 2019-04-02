import {
  SlackEventMiddlewareArgs, SlackCommandMiddlewareArgs, SlackActionMiddlewareArgs, SlackAction,
} from './middleware/types';

/**
 * Internal data type for capturing the class of event processed in Slapp#onIncomingEvent()
 */
export enum IncomingEventType {
  Event,
  Action,
  Command,
  Options,
}

/**
 * Helper which finds the type and channel (if any) that any specific incoming event is related to.
 *
 * This is analogous to WhenEventHasChannelContext and the conditional type that checks SlackAction for a channel
 * context.
 */
export function getTypeAndConversation(body: any): { type?: IncomingEventType, conversationId?: string } {
  if (body.event !== undefined) {
    const eventBody = (body as SlackEventMiddlewareArgs<string>['body']);
    return {
      type: IncomingEventType.Event,
      conversationId:
        eventBody.event.channel !== undefined ? eventBody.event.channel :
        eventBody.event.item !== undefined ? eventBody.event.item.channel : undefined,
    };
  }
  if (body.command !== undefined) {
    return {
      type: IncomingEventType.Command,
      conversationId: (body as SlackCommandMiddlewareArgs['body']).channel_id,
    };
  }
  if (body.name !== undefined) {
    return {
      type: IncomingEventType.Options,
      // TODO: don't options have a channel context when they are within interactive messages?
    };
  }
  if (body.actions !== undefined || body.type === 'dialog_submission') {
    return {
      type: IncomingEventType.Action,
      conversationId: (body as SlackActionMiddlewareArgs<SlackAction>['body']).channel.id,
    };
  }
  return {};
}

/** Helper that should never be called, but is useful for exhaustiveness checking in conditional branches */
export function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${x}`);
}
