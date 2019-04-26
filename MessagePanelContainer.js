import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getUserPublicChannels } from '../../../../store/chat';

import LoadingAnimation from '../../../AuthScreen/LoadingAnimation';
import MessagePanel from './Component';

//component for showing chat lists of all chats the current user is in
class MessagePanelContainer extends Component {
  constructor(props) {
    super(props);
  }

  // get public and private channels from redux
  componentDidMount() {
    this.props.getUserPublicChannels();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.mountainsInRange &&
      prevProps.mountainsInRange !== this.props.mountainsInRange
    ) {
      this.props.getUserPublicChannels();
    }
  }

  render() {
    return !this.props.loadPublicChannels && this.props.publicChannels ? (
      <MessagePanel publicChannels={this.props.publicChannels} />
    ) : (
      <LoadingAnimation />
    );
  }
}

const mapStateToProps = state => ({
  publicChannels: state.chat.publicChannels,
  loadPublicChannels: state.chat.loadPublicChannels,
  mountainsInRange: state.session.mountainsInRange
});

const mapDispatchToProps = {
  getUserPublicChannels
};

export default connect(mapStateToProps, mapDispatchToProps)(
  MessagePanelContainer
);
