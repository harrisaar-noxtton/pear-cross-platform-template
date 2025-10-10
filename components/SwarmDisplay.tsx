import * as React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform, useWindowDimensions } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { PRIMARY_GREEN_COLOR } from '@/constants/Colors';
import { FONT_SIZE_SMALL, FONT_SIZE_LARGE } from '@/constants/Typography';
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

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 600;

  const handleCopyTopicKey = async (): Promise<void> => {
    await Clipboard.setStringAsync(topicKey);
  };

  if(workletStatus !== ConnectionStatus.online){
    return <></>;
  }

  if (swarmStatus === ConnectionStatus.connecting) {
    return (
      <View style={styles.loaderContainer}>
        <JoiningSwarmLoader />
      </View>
    );
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
    <View style={[styles.onlineContent, isSmallScreen && styles.onlineContentSmall]}>
      <ConnectedPairsDisplay peersCount={peersCount} />
      <View style={[styles.topicKeyContainer, isSmallScreen && styles.topicKeyContainerSmall]}>
        <Text style={[styles.topicKeyText, isSmallScreen && styles.topicKeyTextSmall]} numberOfLines={1} ellipsizeMode="middle">
          {topicKey.slice(0,20).concat("...")}
        </Text>
        <CopyButton onPress={handleCopyTopicKey} />
      </View>
    </View>
  );
};

export default SwarmDisplay;

const styles = StyleSheet.create({
  loaderContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  offlineContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    maxWidth: 400,
    width: '100%',
  },
  onlineContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  onlineContentSmall: {
    gap: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  generateButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: PRIMARY_GREEN_COLOR,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  generateButtonText: {
    color: PRIMARY_GREEN_COLOR,
    fontSize: FONT_SIZE_LARGE,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  topicKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 300,
  },
  topicKeyContainerSmall: {
    maxWidth: '100%',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  topicKeyText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: FONT_SIZE_SMALL,
    fontFamily: 'monospace',
  },
  topicKeyTextSmall: {
    fontSize: 10,
  },
  copyButton: {
    padding: 4,
  },
});