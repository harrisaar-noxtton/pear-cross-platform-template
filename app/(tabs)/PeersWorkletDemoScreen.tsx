import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { PRIMARY_BLACK_COLOR } from '@/constants/Colors';
import ConnectedPairsDisplay from '@/components/ConnectedPairsDisplay';
import JoinButton from '@/components/JoinButton';
import JoiningSwarmLoader from '@/components/JoiningSwarmLoader';
import LeaveButton from '@/components/LeaveButton';
import { useWorkletDesktop } from '@/hooks/useWorkletDesktop';

interface Props {}

export enum WorkletStatus {
  offline = "offline",
  online = "online",
  connecting = "connecting"
}

export default function PeersWorkletDemoScreen(props: Props): React.ReactElement {
  const {} = props;
  
  const [peersCount, setPeersCount] = useState<number>(0);
  const [isDestroyLoading, setIsDestroyLoading] = useState<boolean>(false);

  const { status, disconnect, connect } = useWorkletDesktop({
    onPeersUpdated: (peersCount: number) => {
      setPeersCount(peersCount);
    }
  });

  const handleJoinNetwork = async (): Promise<void> => {
    await connect();
  };

  const handleDestroyConnection = async (): Promise<void> => {
    setIsDestroyLoading(true);
    await disconnect();
  };

  React.useEffect(() => {
    if (status === WorkletStatus.offline && isDestroyLoading) {
      setIsDestroyLoading(false);
    }
  }, [status, isDestroyLoading]);

  if (status === WorkletStatus.connecting) {
    return (
      <View style={styles.container}>
        <JoiningSwarmLoader />
      </View>
    )
  }

  if (status === WorkletStatus.offline) {
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
