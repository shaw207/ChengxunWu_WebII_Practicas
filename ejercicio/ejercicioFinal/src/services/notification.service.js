import { env } from '../config/index.js';
import { logger } from './logger.service.js';
import { EventEmitter } from 'node:events';

export const userEvents = new EventEmitter();

export const emitUserEvent = (event, payload) => {
  userEvents.emit(event, payload);
  logger.info({ event, ...payload }, 'user event');
};

export const notifyServerError = async ({ error, req }) => {
  if (!env.SLACK_WEBHOOK_URL) {
    return;
  }

  const payload = {
    text: 'Error 5XX en BildyApp API',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${req.method} ${req.originalUrl}*\n${error.message}`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Timestamp: ${new Date().toISOString()}`
          }
        ]
      }
    ]
  };

  try {
    await fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (notificationError) {
    logger.error({ err: notificationError }, 'slack notification failed');
  }
};
