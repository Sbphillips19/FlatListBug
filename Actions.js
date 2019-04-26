import * as types from './actionTypes';
import firebaseService from '../../services/firebase';
import * as firebase from 'firebase';
import Promise from 'promise';
import md5 from 'md5';
import geolib from 'geolib';

import firebaseService from '../services/firebase';

const FIREBASE_REF_CHANNELS = firebaseService.database().ref('Chats');
const FIREBASE_REF_USERS = firebaseService.database().ref('Users');
const FIREBASE_REF_MESSAGES = firebaseService.database().ref('ChatMessages');
const FIREBASE_REF_CHANNEL_INFO = firebaseService.database().ref('ChannelInfo');
const FIREBASE_REF_MOUNTAINS = firebaseService.database().ref('MountainInfo');
const FIREBASE_REF_REPORTED = firebaseService.database().ref('ReportedUsers');
const FIREBASE_REF_BLOCKED = firebaseService.database().ref('Blocked');

import Config from 'react-native-config';

const FBSDK = require('react-native-fbsdk');
const { LoginManager, AccessToken, GraphRequest, GraphRequestManager } = FBSDK;

// import statusCodes along with GoogleSignin
import { GoogleSignin, statusCodes } from 'react-native-google-signin';

export const getLocation = () => {
  return dispatch => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const userLatitude = position.coords.latitude;
        const userLongitude = position.coords.longitude;

        return FIREBASE_REF_MOUNTAINS.once('value')
          .then(snapshot => {
            let mountains = [];
            snapshot.forEach(channelSnapshot => {
              let channelId = channelSnapshot.key;
              let channelInfo = channelSnapshot.val();

              let mountainLatitude = channelInfo.latitude;
              let mountainLongitude = channelInfo.longitude;

              // checks if userLat and userLong is within a radius of 20km from resort
              let isInsideRadius = geolib.isPointInCircle(
                { latitude: userLatitude, longitude: userLongitude },
                { latitude: mountainLatitude, longitude: mountainLongitude },
                50000
              );

              if (isInsideRadius) {
                mountains.push({ id: channelId, info: channelInfo });
              }
            });
            return Promise.all(mountains);
          })
          .then(mountains => dispatch(mountainsSuccess(mountains)))
          .catch(error => dispatch(mountainsFailure(error)))
          .then(dispatch(locationSuccess(position.coords)))
          .catch(error => dispatch(locationError(error)));
      },
      error => dispatch(locationError(error)),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };
};

const mountainsSuccess = mountains => ({
  type: types.MOUNTAINS_SUCCESS,
  mountainsInRange: mountains
});

const mountainsFailure = error => ({
  type: types.MOUNTAINS_ERROR,
  error
});

const locationSuccess = location => ({
  type: types.LOCATION_SUCCESS,
  location
});

const locationError = error => ({
  type: types.LOCATION_ERROR,
  error
});

// restoring session on initial login if user is already logged in
export const restoreSession = () => {
  return dispatch => {
    dispatch(sessionRestoring());

    let unsubscribe = firebaseService.auth().onAuthStateChanged(user => {
      if (user) {
        const currentUser = FIREBASE_REF_USERS.child(`${user.uid}`);
        currentUser.once('value').then(snapshot => {
          const snapshotVal = snapshot.val();
          console.log('restoring next line is get location');
          dispatch(getLocation());
          dispatch(sessionSuccess(snapshotVal));
        });
        unsubscribe();
      } else {
        dispatch(sessionLogout());
        unsubscribe();
      }
    });
  };
};

//login user with email and password
export const loginUser = (email, password) => {
  return dispatch => {
    dispatch(sessionLoading());

    firebaseService
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch(error => {
        if (
          error.message ===
          'The password is invalid or the user does not have a password.'
        ) {
          const dbUsers = FIREBASE_REF_USERS;
          dbUsers.once('value').then(snapshot => {
            const snapshotValUsers = snapshot.val();
            if (snapshotValUsers) {
              dispatch(
                sessionError(
                  'Please login with Facebook or Google Authentication'
                )
              );
            } else {
              dispatch(sessionError(error.message));
            }
          });
        } else {
          dispatch(sessionError(error.message));
        }
      });

    let unsubscribe = firebaseService.auth().onAuthStateChanged(user => {
      if (user) {
        const currentUser = FIREBASE_REF_USERS.child(`${user.uid}`);
        currentUser.once('value').then(snapshot => {
          const snapshotVal = snapshot.val();
          dispatch(getLocation());
          dispatch(sessionSuccess(snapshotVal));
        });
        unsubscribe();
      }
    });
  };
};

const sessionRestoring = () => ({
  type: types.SESSION_RESTORING
});

const sessionLoading = () => ({
  type: types.SESSION_LOADING
});

const sessionSuccess = user => ({
  type: types.SESSION_SUCCESS,
  user
});

const sessionError = error => ({
  type: types.SESSION_ERROR,
  error
});

const sessionCancelled = () => ({
  type: types.SESSION_CANCELLED
});
