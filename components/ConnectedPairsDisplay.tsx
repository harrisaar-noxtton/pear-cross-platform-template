import { PRIMARY_GREEN_COLOR } from '@/constants/Colors';
import { FONT_SIZE_MEDIUM } from '@/constants/Typography';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  peersCount: number;
}

const ConnectedPairsDisplay = (props: Props): React.ReactElement => {
  const { peersCount } = props;
  
  return (
    <View style={styles.container}>
      <Text style={styles.connectedText}>Connected, {peersCount} 🍐 online</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 6,
    alignItems: 'center'
  },
  connectedText: {
    color: PRIMARY_GREEN_COLOR,
    fontSize: FONT_SIZE_MEDIUM
  }
});

export default ConnectedPairsDisplay;
