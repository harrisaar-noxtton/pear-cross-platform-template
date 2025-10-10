import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { PRIMARY_BLACK_COLOR } from '@/constants/Colors';
import { useWorklet } from '@/hooks/useWorklet';
import SwarmDisplay from '@/components/SwarmDisplay';
import WorkletDisplay from '@/components/WorkletDisplay';
import NotesView from '@/components/NotesView';
import { ConnectionStatus } from '@/hooks/useWorklet';

export interface Note {
  id: string;
  authorId: string;
  messageText: string;
  createdAt: string;
  timestamp: number;
}

interface Props {}

export default function PeersWorkletDemoScreen(props: Props): React.ReactElement {
  const {} = props;
  
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 600;
  
  const [peersCount, setPeersCount] = useState<number>(0);
  const [topicKey, setTopicKey] = useState<string>(process.env.EXPO_PUBLIC_TOPIC_KEY || '');

  const { 
    swarmStatus, 
    joinSwarm, 
    generateTopic, 
    connectWorklet, 
    workletStatus,
    notes,
    appendNote,
    importNotes
  } = useWorklet({
    onPeersUpdated: (peersCount: number) => {
      setPeersCount(peersCount);
    }
  });

  const handleJoinNetwork = async (): Promise<void> => {
    await joinSwarm(topicKey);
  };

  const handleGenerateTopic = async (): Promise<void> => {
    const key = await generateTopic();
    setTopicKey(key);
  };

  const handleConnectWorklet = async (): Promise<void> => {
    await connectWorklet();
  };

  const handleAppendNote = async (text: string): Promise<void> => {
    await appendNote(text);
  };

  const handleImportNotes = async (): Promise<void> => {
    await importNotes();
  };


  return (
    <View style={styles.container}>
      {swarmStatus === ConnectionStatus.online && (
        <NotesView 
          notes={notes || []}
          onAppendNote={handleAppendNote}
          onImportNotes={handleImportNotes}
        />
      )}
      <View style={[styles.bottomSection, isSmallScreen && styles.bottomSectionSmall]}>
        <WorkletDisplay 
          workletStatus={workletStatus}
          onConnectWorklet={handleConnectWorklet}
        />
        <SwarmDisplay 
          workletStatus={workletStatus}
          swarmStatus={swarmStatus}
          peersCount={peersCount}
          topicKey={topicKey}
          onTopicKeyChange={setTopicKey}
          onGenerateTopic={handleGenerateTopic}
          onJoinNetwork={handleJoinNetwork}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_BLACK_COLOR,
    padding: 20,
  },
  bottomSection: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingTop: 20,
  },
  bottomSectionSmall: {
    gap: 10,
    paddingTop: 10,
  },
});