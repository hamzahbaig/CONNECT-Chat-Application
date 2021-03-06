import React from 'react';
import {
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  View,
  ImageBackground,
  StatusBar,
  Image,
} from 'react-native';
import User from '../User';
import firebase from 'firebase';
import PubNubReact from 'pubnub-react';
import * as Animatable from 'react-native-animatable';
import {FloatingAction} from 'react-native-floating-action';

var PushNotification = require('react-native-push-notification');
const actions = [
  {
    text: 'Message',
    name: 'friends',
    position: 1,
    color: '#679AC6',
    icon: require('../assets/message.png'),
  },
  {
    text: 'Find Friend',
    name: 'search',
    position: 2,
    color: '#679AC6',
    icon: require('../assets/search.png'),
  },
];
export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.pubnub = new PubNubReact({
      publishKey: 'pub-c-1a256bc0-f516-4140-83e1-2cd02f72e19b',
      subscribeKey: 'sub-c-1a959da8-ebfb-11e9-ad72-8e6732c0d56b',
    });
    this.pubnub.init(this);
    PushNotification.configure({
      onRegister: function(token) {
        if (token.os == 'android') {
          User.token = token.token;
          this.pubnub.push.addChannels({
            channels: [User.username],
            device: User.token,
            pushGateway: 'gcm', // apns, gcm, mpns
          });
        }
      }.bind(this),

      onNotification: function(notification) {
        console.log('NOTIFICATION:', notification);
      },
      // ANDROID: GCM or FCM Sender ID
      senderID: '168500823310',
    });
  }

  state = {
    users: [],
    count: 1,
  };

  async componentDidMount() {
    console.log(this.state.users,"HAMZAHH")
    User.friends = {};
    User.activeFriendList = [];
    this.setState({users: []});
    let dbRef = firebase.database().ref('users/' + User.username + '/friends/');
    dbRef.orderByChild('latestMsg').on('value', snapshot => {
      if (snapshot.val()) {
        snapshot.forEach(user => {
          let item = {
            name: user.val().name,
            username: user.val().username,
            profileLink: user.val().profileLink,
            latestMsg: user.val().latestMsg,
            active: user.val().active,
          };
          if (item.latestMsg.length > 40) {
            item.latestMsg = item.latestMsg.substring(0, 40) + '...';
          }
          if (User.friends[item.username]) {
            User.activeFriendList.forEach(user => {
              if (user.username == item.username) {
                user.latestMsg = item.latestMsg;
              }
            });
          } else if(User.username != item.username) {
            User.friends[item.username] = item;
            User.activeFriendList.push(item);
          }
          if (item.active == true && User.username != item.username) {
            this.setState({
              users: User.activeFriendList,
            });
          }
        });
      }
    });

    let dbRef1 = firebase
      .database()
      .ref('users/' + User.username + '/friends/');
    dbRef1.orderByChild('name').on('value', snapshot => {
      if (snapshot.val()) {
        snapshot.forEach(user => {
          let item = {
            name: user.val().name,
            username: user.val().username,
            active: user.val().active,
          };
          if (User.friends[item.username]) {
            User.activeFriendList.forEach(user => {
              if (user.username == item.username) {
                user.name = item.name;
              }
            });
          } else if(User.username != item.username) {
            User.friends[item.username] = item;
            User.activeFriendList.push(item);
          }
          if (item.active == true && User.username != item.username) {
            this.setState({
              users: User.activeFriendList,
            });
          }
        });
      }
    });

    let dbRef2 = firebase
      .database()
      .ref('users/' + User.username + '/friends/');
    dbRef2.orderByChild('profileLink').on('value', snapshot => {
      if (snapshot.val()) {
        snapshot.forEach(user => {
          let item = {
            name: user.val().name,
            username: user.val().username,
            profileLink: user.val().profileLink,
            active: user.val().active,
          };
          if (User.friends[item.username]) {
            User.activeFriendList.forEach(user => {
              if (user.username == item.username) {
                user.profileLink = item.profileLink;
              }
            });
          } else if(User.username != item.username) {
            User.friends[item.username] = item;
            User.activeFriendList.push(item);
          }
          if (item.active == true && User.username != item.username) {
            this.setState({
              users: User.activeFriendList,
            });
          }
        });
      }
    });

    let dbRef3 = firebase
      .database()
      .ref('users/' + User.username + '/friends/');
    dbRef3.orderByChild('readStatus').on('value', snapshot => {
      if (snapshot.val()) {
        snapshot.forEach(user => {
          let item = {
            name: user.val().name,
            username: user.val().username,
            active: user.val().active,
            readStatus: user.val().readStatus,
          };
          if (User.friends[item.username]) {
            User.activeFriendList.forEach(user => {
              if (user.username == item.username) {
                user.readStatus = item.readStatus;
              }
            });
          } else if(User.username != item.username) {
            User.friends[item.username] = item;
            User.activeFriendList.push(item);
          }
          if (item.active == true && User.username != item.username) {
            this.setState({
              users: User.activeFriendList,
            });
          }
        });
      }
    });
  }

  renderRow = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => this.props.navigation.navigate('ChatScreen', item)}
        style={{marginTop: 20, flexDirection: 'row', alignItems: 'center'}}>
        <Image
          source={
            item.profileLink == 'NaN'
              ? require('../assets/NaN.png')
              : {uri: item.profileLink}
          }
          style={styles.userPhoto}></Image>
        <View>
          <Text
            style={{
              fontSize: 20,
              marginLeft: 15,
              color: '#679AC6',
              fontWeight: item.readStatus ? 'bold' : null,
            }}>
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: 14,
              marginLeft: 15,
              color: 'rgba(0,0,0,0.7)',
              fontWeight: item.readStatus ? 'bold' : null,
            }}>
            {item.latestMsg}
          </Text>
        </View>
        {item.readStatus ? (
          <View
            style={{
              height: 20,
              width: 20,
              borderRadius: 100,
              backgroundColor: '#679AC6',
              position: 'absolute',
              right: 0,
              marginRight: 20,
            }}></View>
        ) : null}
      </TouchableOpacity>
    );
  };
  renderName = () => {
    for (let i = 0; i < User.name.length; i++) {
      if (User.name[i] == ' ') {
        return User.name.substring(0, i);
      }
    }
    return User.name.substring(0, 7);
  };
  render() {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#679AC6" barStyle="light-content" />

        <ImageBackground
          source={require('../assets/wallpaper1.png')}
          style={styles.backgorundImage}>
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate('ProfileScreen', {
                refresh: () => {
                  this.setState({});
                },
              })
            }>
            <Animatable.View
              animation="slideInRight"
              style={styles.subContainer}>
              <View style={styles.profileViewContainer}>
                <View style={{width: '30%'}}>
                  <Image
                    source={
                      User.photo == 'NaN'
                        ? require('../assets/NaN.png')
                        : {uri: User.photo}
                    }
                    style={styles.profilePhoto}></Image>
                </View>

                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '70%',
                  }}>
                  <Text
                    style={{
                      color: '#679AC6',
                      fontWeight: 'bold',
                    }}>
                    {this.renderName()}
                  </Text>
                </View>
              </View>
            </Animatable.View>
          </TouchableOpacity>
          <View style={{width: '90%', alignSelf: 'center', marginTop: 30}}>
            <Text style={{color: '#9A9A9A', fontSize: 14}}>
              Active Conversations
            </Text>
          </View>
          <FlatList
            style={{marginTop: 20}}
            data={this.state.users}
            renderItem={this.renderRow}
            keyExtractor={item => item.username}
            extraData={this.state.users}
          />
          <FloatingAction
            color="#679AC6"
            actions={actions}
            onPressItem={name => {
              if (name == 'search') {
                this.props.navigation.navigate('SearchScreen');
              } else if (name == 'friends') {
                this.props.navigation.navigate('FriendsScreen');
              }
            }}
          />
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgorundImage: {width: '100%', height: '100%'},
  subContainer: {
    width: '90%',
    height: 35,
    alignSelf: 'center',
    marginTop: 20,
    flexDirection: 'row-reverse',
  },
  profileViewContainer: {
    width: 100,
    height: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 30,
    borderWidth: 1.2,
    borderColor: '#679AC6',
  },
  profilePhoto: {
    width: 30,
    height: 30,
    borderRadius: 100,
    marginLeft: 2,
  },
  userPhoto: {
    height: 45,
    width: 45,
    borderRadius: 100,
    marginLeft: 15,
  },
});
