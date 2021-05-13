import {PubSubError} from './pubsubError';
import {PubSubSuccess} from './pubsubSuccess';

export type PubSubOptions = {
  publish: <T = any>(topic: string, data: T) => Promise<PubSubSuccess | PubSubError>;
  parsePushData: <T = any>() => T;
};
