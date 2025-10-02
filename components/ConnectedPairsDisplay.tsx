import { PRIMARY_GREEN_COLOR } from '@/constants/Colors';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  peerCount: number;
}

const ConnectedPairsDisplay = (props: Props): React.ReactElement => {
  const { peerCount } = props;
  
  return (
    <View style={styles.container}>
      <Text style={styles.connectedText}>Connected, {peerCount} 🍐 online</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center'
  },
  connectedText: {
    color: PRIMARY_GREEN_COLOR,
    fontSize: 16
  }
});

export default ConnectedPairsDisplay;
