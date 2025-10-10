import * as React from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, Text, Platform } from 'react-native';
import { PRIMARY_BLUE_COLOR, PRIMARY_GREEN_COLOR } from '@/constants/Colors';
import { FONT_SIZE_MEDIUM } from '@/constants/Typography';
import { ConnectionStatus } from '@/hooks/useWorklet';

const styled = Platform.OS === 'web' 
  ? require('styled-components').default 
  : require('styled-components/native').default;

const JoinWorkletButtonStyled = styled(Platform.OS === 'web' ? 'button' : TouchableOpacity)`
  padding: 6px 12px;
  border-radius: 6px;
  border-width: 2px;
  border-color: ${PRIMARY_GREEN_COLOR};
  background-color: transparent;
  align-items: center;

  transition: all 0.3s ease-in-out;
  cursor: pointer;

  &:hover {
    border-color: ${PRIMARY_BLUE_COLOR};
  }
`;


interface Props {
  workletStatus: ConnectionStatus;
  onConnectWorklet: () => Promise<void>;
}

const WorkletDisplay = (props: Props): React.ReactElement => {
  const { workletStatus, onConnectWorklet } = props;

  if (workletStatus === ConnectionStatus.offline) {
    return (
      <View style={styles.workletSection}>
        <JoinWorkletButtonStyled onPress={onConnectWorklet} onClick={onConnectWorklet}>
          <Text style={styles.buttonText}>Join Worklet</Text>
        </JoinWorkletButtonStyled>
      </View>
    );
  }

  if (workletStatus === ConnectionStatus.connecting) {
    return (
      <View style={styles.workletSection}>
        <ActivityIndicator size="small" color={PRIMARY_GREEN_COLOR} />
        <Text style={styles.workletStatusText}>Connecting...</Text>
      </View>
    );
  }

  if (workletStatus === ConnectionStatus.online) {
    return (
      <View style={styles.workletSection}>
        <Text style={styles.workletStatusText}>Worklet Online</Text>
      </View>
    );
  }

  return <View style={styles.workletSection} />;
};

export default WorkletDisplay;

const styles = StyleSheet.create({
  buttonText: {
    color: PRIMARY_GREEN_COLOR,
    fontSize: FONT_SIZE_MEDIUM,
    fontWeight: '600',
  },
  workletSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workletStatusText: {
    color: PRIMARY_GREEN_COLOR,
    fontSize: FONT_SIZE_MEDIUM,
    fontWeight: '500',
  },
});
