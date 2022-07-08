'use strict';

const { JWT } = require('google-auth-library');
const admin = require('firebase-admin');
// const { applicationDefault } = require('firebase-admin/app');

// async function init() {
//   admin.initializeApp({
//     credential: applicationDefault(),
//   });
// }

async function sendMessage() {
  admin.initializeApp();
  const registrationTokens =
    'c8s2B1iFi07dhx3N3QXRez:APA91bEU290njmXedpBulfZw5MCtZT6hgIRZ1CQeJKFbECGkpQRayMXtlQ9ZFt83dRrrHBGeD3F3hZ2VEhUiXnuerqGkQDsdh2GdbojME6dSM3aq9q4rWwh0zk5i6wVv9VK0jgV4XM1J';
  console.log('test: send before:');
  admin
    .messaging()
    .send({
      token: registrationTokens,
      notification: {
        body: 'This is an FCM notification that displays an image!',
        title: 'FCM Notification',
      },
    })
    .then((result) => {
      console.log('test: send success: ', result);
    })
    .catch((error) => {
      console.log('test: send fail: ', error);
    });
}

async function getAccessToken() {
  const key = require('/Users/asterisk/Configs/service-account-file.json');
  const jwtClient = new JWT({
    email: key.client_email,
    keyFile: null,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    subject: null,
    eagerRefreshThresholdMillis: 10000,
  });
  console.log('getAccessToken: 1: ', jwtClient);
  const ret = await jwtClient.authorize();
  console.log('getAccessToken: ret: ', ret.access_token);
  console.log('getAccessToken: 2');
}

async function main() {
  // console.log('main: init:');
  // await init();

  console.log('main: getAccessToken:');
  await getAccessToken();

  console.log('main: sendMessage:');
  await sendMessage();
}

main();
