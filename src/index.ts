import {PubSub} from '@google-cloud/pubsub';
import {NextFunction, Request, Response} from 'express';

import {PubSubOptions} from './Types/pubsub';
import {PubSubError} from './Types/pubsubError';
import {PubSubSuccess} from './Types/pubsubSuccess';
import {PushBody} from './Types/pushBody';
import {Settings} from './Types/settings';

export type { PubSubSuccess } from './Types/pubsubSuccess';
export type { PubSubError } from './Types/pubsubError';

declare global {
  namespace Express {
    interface Request {
      pubsub: PubSubOptions;
    }
  }
}

export default (settings: Settings) => {
  const pubSubClient = new PubSub();

  return (req: Request, res: Response, next: NextFunction) => {
    req.pubsub = {
      publish: async <T = any>(topic: string, data: T): Promise<PubSubSuccess | PubSubError> => {
        const dataBuffer = Buffer.from(JSON.stringify(data));

        try {
          const messageId = await pubSubClient.topic(topic).publish(dataBuffer);
          return {
            success: true,
            data: {
              messageId,
            },
          };
        } catch (e) {
          return {
            success: false,
            data: {
              message: e.message,
            },
          };
        }
      },
      parsePushData: <T = any>(): T => {
        const pushBody: PushBody = req.body;
        const encodedData: string = pushBody.message.data;
        const decodedData: string = Buffer.from(encodedData, 'base64').toString('ascii');

        return JSON.parse(decodedData) as T;
      },
    };

    next();
  };
};
