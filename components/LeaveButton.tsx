// LeaveButton.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY_RED_COLOR = '#FF6B6B';

interface Props {
  isLoading?: boolean;
}

const LeaveButton = (props: Props): React.ReactElement => {
  const { isLoading = false } = props;

  return (
    <View style={styles.leaveButtonContent}>
      {!isLoading && <Ionicons name="exit" size={18} color={PRIMARY_RED_COLOR} />}
      <Text style={styles.destroyButtonText}>
        {isLoading ? 'Leaving...' : 'Leave'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
