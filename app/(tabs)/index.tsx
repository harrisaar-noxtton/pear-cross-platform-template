// app/(tabs)/index.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { PRIMARY_BLACK_COLOR, PRIMARY_GREEN_COLOR, WHITE_COLOR, PRIMARY_TEXT_GRAY } from '@/constants/Colors';

interface Props {}

export default function TabOneScreen(props: Props): React.ReactElement {
  const {} = props;

  return (
    <View style={styles.container}>

      
      <View style={styles.contentContainer}>
        <Text style={styles.description}>
          This is a demonstration for cross-platform Expo React-Native
           and Desktop application using Pear by Holepunch P2P technologies.
        </Text>
        <Text style={styles.description}>
          Go to "P2P" tab to join the swarm. 
          (Open the app in two devices, one in Mobile and another in a Desktop to see that they are able to communicate.)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_BLACK_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: PRIMARY_GREEN_COLOR,
    textAlign: 'center',
    marginBottom: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 18,
    lineHeight: 28,
    color: WHITE_COLOR,
    textAlign: 'center',
    marginBottom: 30,
  },
});
