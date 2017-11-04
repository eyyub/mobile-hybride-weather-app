import React from 'react';
import { StyleSheet, Platform, Image, Text, View, UIManager } from 'react-native';
import { StackNavigator } from 'react-navigation';
import {COLOR, ThemeProvider} from 'react-native-material-ui';

import firebase from 'react-native-firebase';
import WeatherList from './weather/list';

import GooglePlacesInput from './weather/places';

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

export default App = StackNavigator({
  Main : {
    screen: WeatherList
  },
  Places : {
    screen: GooglePlacesInput
  }
});
