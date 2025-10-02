// LeaveButton.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const PRIMARY_RED_COLOR = '#FF6B6B';

interface Props {
  isLoading?: boolean;
  onPress: () => void;
}

const LeaveButton = (props: Props): React.ReactElement => {
  const { isLoading = false, onPress } = props;

  return (
    <TouchableOpacity style={styles.destroyButton} onPress={onPress}>
      <View style={styles.leaveButtonContent}>
        <Text style={styles.destroyButtonText}>
          {isLoading ? 'Leaving...' : 'Leave'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  destroyButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: PRIMARY_RED_COLOR,
    borderRadius: 5,
  },
  leaveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  destroyButtonText: {
    color: PRIMARY_RED_COLOR,
    fontSize: 12,
  },
});

export default LeaveButton;
