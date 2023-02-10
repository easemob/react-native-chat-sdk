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
