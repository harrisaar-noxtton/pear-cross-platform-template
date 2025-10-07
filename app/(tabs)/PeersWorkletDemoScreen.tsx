import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PRIMARY_BLACK_COLOR } from '@/constants/Colors';
import { useWorklet } from '@/hooks/useWorklet';
import SwarmDisplay from '@/components/SwarmDisplay';
import WorkletDisplay from '@/components/WorkletDisplay';

interface Props {}

export default function PeersWorkletDemoScreen(props: Props): React.ReactElement {
  const {} = props;
  
  const [peersCount, setPeersCount] = useState<number>(0);
  const [topicKey, setTopicKey] = useState<string>(process.env.EXPO_PUBLIC_TOPIC_KEY || '');
  const [isLeavingSwarm, setIsLeavingSwarm] = useState<boolean>(false);

  const { 
    swarmStatus, 
    leaveSwarm, 
    joinSwarm, 
    generateTopic, 
    connectWorklet, 
    workletStatus 
  } = useWorklet({
    onPeersUpdated: (peersCount: number) => {
      setPeersCount(peersCount);
    }
  });

  const handleJoinNetwork = async (): Promise<void> => {
    await joinSwarm(topicKey);
  };

  const handleDestroyConnection = async (): Promise<void> => {
    setIsLeavingSwarm(true);
    await leaveSwarm();
    setIsLeavingSwarm(false);
  };

  const handleGenerateTopic = async (): Promise<void> => {
    const key = await generateTopic();
    setTopicKey(key);
  };

  const handleConnectWorklet = async (): Promise<void> => {
    await connectWorklet();
  };

  return (
    <View style={styles.container}>
      <WorkletDisplay 
        workletStatus={workletStatus}
        onConnectWorklet={handleConnectWorklet}
      />
      <SwarmDisplay 
        workletStatus={workletStatus}
        swarmStatus={swarmStatus}
        peersCount={peersCount}
        topicKey={topicKey}
        isLeavingSwarm={isLeavingSwarm}
        onTopicKeyChange={setTopicKey}
        onGenerateTopic={handleGenerateTopic}
        onJoinNetwork={handleJoinNetwork}
        onLeaveSwarm={handleDestroyConnection}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_BLACK_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});