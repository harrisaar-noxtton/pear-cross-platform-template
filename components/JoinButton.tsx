import * as React from 'react';
import { PRIMARY_GREEN_COLOR } from '@/constants/Colors';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  onPress: () => void;
}

const JoinButton = (props: Props): React.ReactElement => {
  const { onPress } = props;
  
  return (
    <TouchableOpacity
      style={styles.joinButton}
      onPress={onPress}
    >
      <Text style={styles.joinText}>Join Swarm</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  joinButton: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: PRIMARY_GREEN_COLOR,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  joinText: {
    color: PRIMARY_GREEN_COLOR,
    fontSize: 14,
    fontWeight: '600',
  }
});

export default JoinButton;