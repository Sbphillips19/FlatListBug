import React, { Component } from 'react';
import { View, Text, FlatList, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { changeChannelPublic } from '../../../../store/chat';
import { ListItem } from 'react-native-elements';
import { withNavigation } from 'react-navigation';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import styles from './Styles';

class MessagePanelComponent extends Component {
  constructor() {
    super();
  }

  render() {
    // rendering all public channels
    const renderPublicChannels = ({ item }) => {
      return (
        <ListItem
          leftAvatar={{
            source: { uri: item.info.ChannelPicture },
            rounded: false,
            overlayContainerStyle: { backgroundColor: 'white' }
          }}
          title={item.info.Name}
          titleStyle={styles.title}
          chevron={true}
          bottomDivider={true}
          id={item.Name}
          onPress={() => {
            this.props.changeChannelPublic(item.id),
              this.props.navigation.navigate('Chat', {
                chatName: `${item.info.Name}`
              });
          }}
          containerStyle={styles.listItemStyle}
        />
      );
    };

    return (
      <View style={styles.container}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={['#000000', '#434343']}
          style={styles.channelType}
        >
          <Text style={styles.channelTypeText}>PUBLIC CHANNELS</Text>
        </LinearGradient>
        <View style={styles.publicChannelList}>
          <FlatList
            data={this.props.publicChannels}
            renderItem={renderPublicChannels}
            keyExtractor={item => item.Name}
            extraData={this.props.publicChannels}
            removeClippedSubviews={false}
          />
        </View>
      </View>
    );
  }
}

const mapDispatchToProps = {
  changeChannelPublic
};

export default withNavigation(
  connect(null, mapDispatchToProps)(MessagePanelComponent)
);
