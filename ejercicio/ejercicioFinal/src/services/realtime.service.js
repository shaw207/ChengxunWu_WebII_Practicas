import { companyRoom, getSocketServer } from '../config/socket.js';
import { logger } from './logger.service.js';

export const REALTIME_EVENTS = {
  CLIENT_NEW: 'client:new',
  PROJECT_NEW: 'project:new',
  DELIVERY_NOTE_NEW: 'deliverynote:new',
  DELIVERY_NOTE_SIGNED: 'deliverynote:signed'
};

export const emitToCompany = (companyId, event, payload) => {
  const io = getSocketServer();

  if (!io || !companyId) {
    logger.debug({ event, companyId }, 'realtime event skipped');
    return;
  }

  io.to(companyRoom(companyId)).emit(event, {
    ...payload,
    timestamp: new Date().toISOString()
  });
};
