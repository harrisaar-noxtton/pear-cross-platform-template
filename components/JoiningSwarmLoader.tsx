// JoiningSwarmLoader.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { PRIMARY_GREEN_COLOR, WHITE_COLOR } from '@/constants/Colors';

interface Props {}

const JoiningSwarmLoader = (props: Props): React.ReactElement => {
  const {} = props;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect((): (() => void) => {
    const startBouncing = (): void => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          })
        ])
      ).start();
    };

    startBouncing();

    return (): void => {
      bounceAnim.stopAnimation();
    };
  }, [bounceAnim]);

  return (
    <View style={styles.container}>
      <Animated.Text 
        style={[
          styles.pairIcon,
          { transform: [{ translateY: bounceAnim }] }
        ]}
      >
        🍐
      </Animated.Text>
      <Text style={styles.text}>Joining swarm...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  pairIcon: {
    fontSize: 32,
    marginBottom: 20
  },
  text: {
    color: PRIMARY_GREEN_COLOR,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500'
  }
});

export default JoiningSwarmLoader;
