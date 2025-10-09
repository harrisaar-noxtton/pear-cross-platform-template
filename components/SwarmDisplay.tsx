import * as React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { PRIMARY_GREEN_COLOR } from '@/constants/Colors';
import ConnectedPairsDisplay from '@/components/ConnectedPairsDisplay';
import JoinButton from '@/components/JoinButton';
import JoiningSwarmLoader from '@/components/JoiningSwarmLoader';
import LeaveButton from '@/components/LeaveButton';
import TopicKeyInput from '@/components/TopicKeyInput';
import { ConnectionStatus } from '@/hooks/useWorklet';
import CopyButton from '@/components/CopyButton';

interface Props {
  workletStatus: ConnectionStatus;
  swarmStatus: ConnectionStatus;
  peersCount: number;
  topicKey: string;
  onTopicKeyChange: (value: string) => void;
  onGenerateTopic: () => Promise<void>;
  onJoinNetwork: () => Promise<void>;
}

const SwarmDisplay = (props: Props): React.ReactElement => {
  const {
    workletStatus,
    swarmStatus,
    peersCount,
    topicKey,
    onTopicKeyChange,
    onGenerateTopic,
    onJoinNetwork,
  } = props;

  const handleCopyTopicKey = async (): Promise<void> => {
    await Clipboard.setStringAsync(topicKey);
  };

  if(workletStatus !== ConnectionStatus.online){
    return <></>;
  }

  if (swarmStatus === ConnectionStatus.connecting) {
    return <JoiningSwarmLoader />;
  }

  if (swarmStatus === ConnectionStatus.offline) {
    return (
      <View style={styles.offlineContent}>
        <TopicKeyInput value={topicKey} onChangeText={onTopicKeyChange} />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.generateButton} onPress={onGenerateTopic}>
            <Text style={styles.generateButtonText}>Generate Topic</Text>
          </TouchableOpacity>
          <JoinButton onPress={onJoinNetwork} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.onlineContent}>
      <ConnectedPairsDisplay peersCount={peersCount} />
      <View style={styles.topicKeyContainer}>
        <Text style={styles.topicKeyText} numberOfLines={1} ellipsizeMode="middle">
          {topicKey}
        </Text>
        <CopyButton onPress={handleCopyTopicKey} />
      </View>
    </View>
  );
};

export default SwarmDisplay;

const styles = StyleSheet.create({
  offlineContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    maxWidth: 400,
    width: '100%',
  },
  onlineContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  generateButton: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: PRIMARY_GREEN_COLOR,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  generateButtonText: {
    color: PRIMARY_GREEN_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  topicKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    // backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    maxWidth: 400,
  },
  topicKeyText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 4,
  },
});