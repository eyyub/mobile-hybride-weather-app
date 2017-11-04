import React from 'react';
import { View, Image } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import {COLOR, ThemeProvider} from 'react-native-material-ui';

const uiTheme = {
    palette: {
        primaryColor: COLOR.green500,
    },
    toolbar: {
        container: {
            height: 1,
        },
    },
};

export default GooglePlacesInput = ({navigation}) => {
  return (
    <ThemeProvider uiTheme={uiTheme}>
    <GooglePlacesAutocomplete
      placeholder='Search'
      minLength={2}
      autoFocus={false}
      returnKeyType={'search'}
      listViewDisplayed='auto'
      fetchDetails={true}
      renderDescription={row => row.description}
      onPress={(data, details = null) => {

        navigation.state.params.callback({latitude: details.geometry.location.lat, longitude: details.geometry.location.lng});
        navigation.goBack();
      }}

      getDefaultValue={() => ''}

      query={{

        key: 'AIzaSyAffiEoOiNSvxDrtV3kjbVgb0Qw7MKMmWY',
        language: 'en',
        types: '(cities)'
      }}

      styles={{
        textInputContainer: {
          width: '100%'
        },
        description: {
          fontWeight: 'bold'
        },
        predefinedPlacesDescription: {
          color: '#1faadb'
        }
      }}

      nearbyPlacesAPI='GooglePlacesSearch'
      GoogleReverseGeocodingQuery={{

      }}
      GooglePlacesSearchQuery={{

        rankby: 'distance',
        types: 'food'
      }}

      filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']}
      predefinedPlaces={[]}

      debounce={200}

    />
  </ThemeProvider>
  );
}
