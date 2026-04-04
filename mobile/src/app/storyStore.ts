// Simple in-memory store to pass large story data between screens
// Avoids Expo Router param size limits

let _story: any = null;

export const storyStore = {
  set: (data: any) => { _story = data; },
  get: () => _story,
  clear: () => { _story = null; },
};
