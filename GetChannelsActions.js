import * as types from './actionTypes';
import firebaseService from '../../services/firebase';
import firebase from 'firebase';

const FIREBASE_REF_CHANNELS = firebaseService.database().ref('Chats');
const FIREBASE_REF_USERS = firebaseService.database().ref('Users');
const FIREBASE_REF_MESSAGES = firebaseService.database().ref('ChatMessages');
const FIREBASE_REF_CHANNEL_INFO = firebaseService.database().ref('ChannelInfo');
const FIREBASE_REF_MOUNTAINS = firebaseService.database().ref('MountainInfo');
const FIREBASE_REF_REPORTED = firebaseService.database().ref('ReportedUsers');
const FIREBASE_REF_BLOCKED = firebaseService.database().ref('Blocked');

const FIREBASE_REF_MESSAGES_LIMIT = 200;

import Promise from 'promise';

const loadPublicChannels = () => ({
  type: types.LOAD_PUBLIC_CHANNELS
});

const loadPublicChannelsSuccess = channels => ({
  type: types.LOAD_PUBLIC_CHANNELS_SUCCESS,
  publicChannels: channels
});

export const getUserPublicChannels = () => {
  return (dispatch, state) => {
    dispatch(loadPublicChannels());
    console.log('GET PUBLIC STATE', state());
    // get all mountains within distance specified
    let mountainsInRange = state().session.mountainsInRange;
    console.log('RANGE', mountainsInRange);
    // only use if equal to whistler.  Refactor later with multiple mountains
    let currentMountain;
    currentMountain =
      mountainsInRange === undefined || mountainsInRange.length == 0
        ? 'false'
        : mountainsInRange.filter(mountain => mountain.id === 'Whistler');

    // whistler public channels
    let currentMountainPublicChannelsRef = FIREBASE_REF_CHANNEL_INFO.child(
      'Public'
    )
      .child('Whistler')
      .child('Public');

    // whistler private channels- only can see if within range
    let currentMountainPrivateChannelsRef = FIREBASE_REF_CHANNEL_INFO.child(
      'Public'
    )
      .child(`${currentMountain[0].id}`)
      .child('Private');

    // get public channels
    return currentMountainPublicChannelsRef
      .orderByChild('key')
      .once('value')
      .then(snapshot => {
        let publicChannelsToDownload = [];
        snapshot.forEach(channelSnapshot => {
          let channelId = channelSnapshot.key;
          let channelInfo = channelSnapshot.val();
          // add the channel ID to the download list
          publicChannelsToDownload.push({ id: channelId, info: channelInfo });
        });

        // if whistler exists then get private channels/ if in range
        if (currentMountain[0].id) {
          currentMountainPrivateChannelsRef
            .orderByChild('key')
            .once('value')
            .then(snapshot => {
              snapshot.forEach(channelSnapshot => {
                let channelId = channelSnapshot.key;
                let channelInfo = channelSnapshot.val();
                publicChannelsToDownload.push({
                  id: channelId,
                  info: channelInfo
                });
              });
            });
        }
        return publicChannelsToDownload;
      })

      .then(data => {
        dispatch(loadPublicChannelsSuccess(data));
      });
    // .catch(err => {
    //   // currentUserChannelsRef query failed or at least one channel download failed
    //   console.log(err);
    //   dispatch(loadPublicChannelsError(err));
    // });
  };
};
