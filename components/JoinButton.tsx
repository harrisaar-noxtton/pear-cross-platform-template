import { PRIMARY_GREEN_COLOR } from '@/constants/Colors';
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

interface Props {
  onPress: () => void;
}

const JoinButton = (props: Props): React.ReactElement => {
  const { onPress } = props;
  
  return (
    <TouchableOpacity
      style={styles.joinButtonContainer}
      onPress={onPress}
    >
      <View style={styles.circle}>
        <Text style={styles.pairIcon}>🍐</Text>
        <Text style={styles.joinText}>Join</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  joinButtonContainer: {
    alignItems: 'center',
    padding: 10,
    display: 'flex',
    height: '100%',
    justifyContent: 'center'
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: PRIMARY_GREEN_COLOR,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pairIcon: {
    fontSize: 24
  },
  joinText: {
    color: PRIMARY_GREEN_COLOR,
    fontSize: 14,
    marginTop: 4
  }
});

export default JoinButton;
