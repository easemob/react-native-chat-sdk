export const datasheet = {
  AppKey: [],
  PushInfo: {
    sendId: '',
    KeyId: '',
  },
  accounts: [
    {
      id: '',
      mm: '',
    },
  ],
  groups: [
    {
      id: '',
      owner: '',
      name: '',
    },
  ],
  ChatManager: {
    SendMessage: {
      latitude: '0.0',
      longitude: '0.0',
      address: 'beijing',
      action: 'action',
      event: 'event',
      ext: '{ "key": "value" }',
      duration: 20,
    },
  },
};

let env;
try {
  env = require('../../env');
  datasheet.AppKey = env.appKey;
  datasheet.PushInfo = env.PushInfo;
  datasheet.accounts = env.accounts;
  datasheet.groups = env.groups;
  console.log('test:env:success:', env);
} catch (error) {
  console.warn('test:env:', error);
}
