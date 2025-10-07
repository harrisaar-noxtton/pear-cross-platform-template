import * as React from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { PRIMARY_GREEN_COLOR } from '@/constants/Colors';
import { ConnectionStatus } from '@/hooks/useWorklet';

interface Props {
  workletStatus: ConnectionStatus;
  onConnectWorklet: () => Promise<void>;
}

const WorkletDisplay = (props: Props): React.ReactElement => {
  const { workletStatus, onConnectWorklet } = props;

  if (workletStatus === ConnectionStatus.offline) {
    return (
      <View style={styles.workletSection}>
        <TouchableOpacity style={styles.workletButton} onPress={onConnectWorklet}>
          <Text style={styles.workletButtonText}>Join Worklet</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (workletStatus === ConnectionStatus.connecting) {
    return (
      <View style={styles.workletSection}>
        <ActivityIndicator size="large" color={PRIMARY_GREEN_COLOR} />
        <Text style={styles.workletStatusText}>Connecting to Worklet...</Text>
      </View>
    );
  }

  if (workletStatus === ConnectionStatus.online) {
    return (
      <View style={styles.workletSection}>
        <Text style={styles.workletStatusText}>Worklet is online</Text>
      </View>
    );
  }

  return <View style={styles.workletSection} />;
};

export default WorkletDisplay;

const styles = StyleSheet.create({
  workletSection: {
    marginBottom: 30,
    alignItems: 'center',
    gap: 10,
  },
  workletButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: PRIMARY_GREEN_COLOR,
    backgroundColor: 'transparent',
  },
  workletButtonText: {
    color: PRIMARY_GREEN_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },
  workletStatusText: {
    color: PRIMARY_GREEN_COLOR,
    fontSize: 14,
    fontWeight: '500',
  },
});