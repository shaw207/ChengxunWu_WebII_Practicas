import { EventEmitter } from 'node:events';

export const userEvents = new EventEmitter();

userEvents.on('user:registered', (payload) => {
  console.log('user:registered', payload.email);
});

userEvents.on('user:verified', (payload) => {
  console.log('user:verified', payload.email);
});

userEvents.on('user:invited', (payload) => {
  console.log('user:invited', payload.email);
});

userEvents.on('user:deleted', (payload) => {
  console.log('user:deleted', payload.email);
});

export const emitUserEvent = (event, payload) => {
  userEvents.emit(event, payload);
};
