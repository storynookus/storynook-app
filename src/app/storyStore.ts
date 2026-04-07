let _story: any = null;

export const storyStore = {
  set: (data: any) => { _story = data; },
  get: () => _story,
  clear: () => { _story = null; },
};
