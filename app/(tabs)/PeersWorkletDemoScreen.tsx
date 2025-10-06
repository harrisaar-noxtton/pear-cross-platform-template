import * as React from 'react';
import { useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { PRIMARY_BLACK_COLOR } from '@/constants/Colors';
import ConnectedPairsDisplay from '@/components/ConnectedPairsDisplay';
import JoinButton from '@/components/JoinButton';
import JoiningSwarmLoader from '@/components/JoiningSwarmLoader';
import LeaveButton from '@/components/LeaveButton';

interface Props {}

export default function PeersWorkletDemoScreen(props: Props): React.ReactElement {
  const {} = props;
  
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSwarmJoined, setIsSwarmJoined] = useState<boolean>(false);
  const [peersCount, setPeersCount] = useState<number>(0);
  const [isDestroyLoading, setIsDestroyLoading] = useState<boolean>(false);
  const rpcRef = useRef<any>(null);
  const workletRef = useRef<any>(null);

  console.log("PeersWorkletDemoScreen v42");

  const handleJoinNetwork = async (): Promise<void> => {
    // TODO: Implement join network logic
  };

  const handleDestroyConnection = async (): Promise<void> => {
    // TODO: Implement destroy connection logic
  };

  if (isConnecting) {
    return <JoiningSwarmLoader />;
  }

  if (!isSwarmJoined) {
    return (
      <View style={styles.container}>
        <JoinButton onPress={handleJoinNetwork} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ConnectedPairsDisplay peerCount={peersCount} />
      <View style={styles.buttonContainer}>
        {isDestroyLoading && <ActivityIndicator />}
        {!isDestroyLoading && (
          <LeaveButton 
            isLoading={isDestroyLoading} 
            onPress={handleDestroyConnection}
          />
        )}
      </View>
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
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
