import React from 'react';
import { ScrollView, StyleSheet, Platform, Image, Text, View, Button, Dimensions, NetInfo } from 'react-native';
import { ActionButton, ListItem, Card, Avatar, Divider } from 'react-native-material-ui';
// import ActionButton from 'react-native-action-button';
import {COLOR, ThemeProvider} from 'react-native-material-ui';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import firebase from 'react-native-firebase';

const uiTheme = {
    palette: {
        primaryColor: COLOR.green500,
    },
    actionButton: {

      positionContainer:{
        flex:1,
        bottom:5,
        left:0,
        position:'absolute',
      }
    }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom:'20%'
  },

});
const logpagestyles = StyleSheet.create({
  container:{
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  }
});

const imgs = {
  'c' : require('../assets/c.png'),
  'h' : require('../assets/h.png'),
  'hc' : require('../assets/hc.png'),
  'hr' : require('../assets/hr.png'),
  'lc' : require('../assets/lc.png'),
  'lr' : require('../assets/lr.png'),
  's' : require('../assets/s.png'),
  'sl' : require('../assets/sl.png'),
  'sn' : require('../assets/sn.png'),
  't' : require('../assets/t.png')
}

const WeatherItem = (loc) => (
  <View style={{flexDirection: 'row', height:75, width: Dimensions.get('window').width, justifyContent: 'space-between',alignItems: 'center'}} >

    <View style={{flex:0.25, alignItems:'center', height:'100%', width:'100%'}}>
      <Image source={imgs[loc.weather_state_abbr]}/>
    </View>

      <View  style={{flexDirection: 'column', flex:0.5, paddingLeft:10, paddingRight:10, alignItems: 'center'}}>
        <View style={{flex:0.3, alignItems:'center', justifyContent:'center'}}><Text style={{  fontFamily: 'Roboto-Light' }}>{loc.title}{loc.msg ? loc.msg : null}</Text></View>
        <Divider/>
        <View style={{flexDirection: 'column',  flex:0.7, width:'100%'}}>
          <View style={{flexDirection:'row', flex:1, justifyContent: 'space-between'}}>
            <Text style={{  fontFamily: 'Roboto-Bold' }}>{Math.round(loc.the_temp)}°C</Text>
            <Text  style={{  fontFamily:'Roboto-Light' }} >{loc.weather_state_name}</Text>
          </View>
          <Divider/>
          <View style={{flexDirection:'row', flex:1, justifyContent: 'space-between'}}>
            <View style={{ flex:0.33, flexDirection:'row'}}>
              <FeatherIcon name="wind" size={20} color="white" />
              <Text  style={{  fontFamily: 'Roboto-Light' }}>{loc.wind_speed.toFixed(2)}</Text>

            </View>
            <View style={{ flex:0.33, flexDirection:'row'}}>
              <MaterialIcon name="visibility" size={20} color="#403c3c" />
              <Text style={{  fontFamily: 'Roboto-Light' }}>{Math.round(loc.visibility)}</Text>

            </View>
            <View style={{ /*flex:0.3, */flexDirection:'row'}}>
              <EntypoIcon name="drop" size={20} color="#1796fe" />
              <Text style={{  fontFamily: 'Roboto-Light' }}>{loc.humidity}</Text>

            {/* <Image source={require('../assets/humidity.png')} style={{flex:1,width:'25%', height:50, backgroundColor:'blue'}}/> */}
            </View>
        </View>
          {/* <Text>{loc.wind_speed.toFixed(2)}</Text> */}
        </View>
      </View>
      <View style={{ flex:0.2, alignItems:'center'}}><EvilIcon name="close-o" size={72} color="#7d6bd4"  onPress={loc.handleClick} /></View>
    </View>
);

export default class WeatherList extends React.Component {

  static navigationOptions = {
      title: 'Shab Weather',
  };

  state = {
    geoloc: null,
    locations : [],
    is_auth: false,
    has_fetched: false,
    uid: null,
    is_connected:true,
    geoloc_activated:true
  }

  current_loc_weather = () => {

    navigator.geolocation.getCurrentPosition((position) => {
      const {latitude, longitude} = position.coords;

      fetch(`https://www.metaweather.com/api/location/search/?lattlong=${latitude},${longitude}`)
      .then(response => response.json())
      .then(json => fetch(`https://www.metaweather.com/api/location/${json[0]['woeid']}`))
      .then(response => response.json())
      .then(json => this.setState({geoloc : Object.assign(json.consolidated_weather[0], {woeid:json.woeid, title:json.title})}))
      .catch(error => {
        if(error.code == 1) {
          // ask to enable GPS
        }
      })
    },
    (err) => {
      this.setState({geoloc_activated:false});
    },
    { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 });
  };

  get_weather_woeid(woeid) {

    return fetch(`https://www.metaweather.com/api/location/${woeid}`)
    .then(response => response.json());

  }

  get_loc_weather = ({latitude, longitude}) => {

    fetch(`https://www.metaweather.com/api/location/search/?lattlong=${latitude},${longitude}`)
    .then(response => response.json())
    .then(json => json[0]['woeid'])//fetch(`https://www.metaweather.com/api/location/${json[0]['woeid']}`))
    .then(this.get_weather_woeid)
    // .then(response => response.json())
    .then(json => this.setState({locations :[Object.assign(json.consolidated_weather[0], {woeid:json.woeid, title:json.title})].concat(this.state.locations.filter(locs => locs.woeid != json.woeid))}))
    .catch(error => {

      if(error.code == 1) {
        // ask to enable GPS
      }
  });
  }

  handle_auth = () => {
    NetInfo.isConnected.fetch().then(isConnected => {
      if(isConnected)firebase.auth().signInAnonymously()
      .then((u) => {
        this.setState({
          is_auth: true,
          uid: u.uid
        });
      });
      else
        this.setState({is_connected:false});
    });
  }

  fetch_woeids = (user) => {

    const val = user.val();
    if(val != null) {

        Promise.all(val.locations_woeid.map(this.get_weather_woeid))
              .then(json => json.map(o => Object.assign(o.consolidated_weather[0], {woeid:o.woeid, title: o.title})))
              .then(locs => this.setState({locations : locs, has_fetched: true}));
    } else {

      this.setState({locations : [], has_fetched: true});
    }

  }

  look_for_place = () => {
    NetInfo.isConnected.fetch().then(isConnected => {
      if(isConnected) {
        this.props.navigation.navigate('Places', {callback: this.get_loc_weather});
      }
      else
        this.setState({is_connected:false});
    });
  }

  componentDidUpdate(prevProps, prevState) {

    if(prevState.is_auth && this.state.has_fetched && this.state.uid != null) {

      const uid = this.state.uid;
      firebase.database().ref(`users/${uid}`).set({
        locations_woeid: this.state.locations.map(l => l.woeid)
      }).then(() => null); // catch error ?
    }
    else if (!prevState.is_auth && !this.state.has_fetched && this.state.uid != null) { // unauth, fetch data

      const uid = this.state.uid;
      firebase.database().ref(`users/${uid}`).once('value').then(this.fetch_woeids).catch(() => null);//catch -> no value when user first created
    }
  }

  render() {

    if(!this.state.is_connected) {
      return (
        <ThemeProvider uiTheme={uiTheme}>
          <View  style={logpagestyles.container}>
            <Text>You're not connected to internet, please connect.</Text>
            <Button onPress={() => this.setState({is_connected:true})} title="Done!"/>
          </View>
        </ThemeProvider>
      );
    }
    else if(!this.state.geoloc_activated) {
    return (
      <ThemeProvider uiTheme={uiTheme}>
        <View  style={logpagestyles.container}>
          <Text>Geoloc not activated, please switch on and wait few ms before trying again.</Text>
          <Button onPress={() => this.setState({geoloc_activated:true})} title="Done!"/>
        </View>
      </ThemeProvider>
    );
  }
    else if(!this.state.is_auth) {
      return (
        <ThemeProvider uiTheme={uiTheme}>
          <View  style={logpagestyles.container}>
            <Button onPress={this.handle_auth} title="Sign in anon-mode (firebase)"/>


          </View>
        </ThemeProvider>
      );
    }
    else
      return (
      <ThemeProvider uiTheme={uiTheme}>

        <View style={styles.container}>

          {this.state.has_fetched ? null: (<Text>Actually fetching data...</Text>)}
        {this.state.geoloc ? (
          <WeatherItem {...this.state.geoloc} msg="(here)" handleClick={() => this.setState({geoloc:null})} />
        ) : null}


        <ScrollView style={{backgroundColor: '#8fccf9'}}>
          {this.state.locations.map((loc, i) => (
            <View  key={loc.id}>
              <WeatherItem {...loc} handleClick={() => this.setState({locations: this.state.locations.filter((l) => l.id != loc.id)})}/>
            <Divider/>
          </View>
          ))}

        </ScrollView>


      {this.state.has_fetched ? (<ActionButton  icon="add" style={{positionContainer: {left: '2%'}}} onPress={this.look_for_place}/>) : null}
      <ActionButton  icon="pin-drop" style={{positionContainer: {left: '20%'}}} onPress={this.current_loc_weather}/>

      </View>
      </ThemeProvider>

    );

  }
}
