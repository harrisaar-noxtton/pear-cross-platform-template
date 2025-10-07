import * as React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { INPUT_BACKGROUND_COLOR, PRIMARY_GREEN_COLOR, PLACEHOLDER_COLOR } from '@/constants/Colors';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

const TopicKeyInput = (props: Props): React.ReactElement => {
  const { value, onChangeText } = props;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Enter Topic Key"
        placeholderTextColor={PLACEHOLDER_COLOR}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    backgroundColor: INPUT_BACKGROUND_COLOR,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: PRIMARY_GREEN_COLOR,
    borderWidth: 2,
    borderColor: PRIMARY_GREEN_COLOR,
  },
});

export default TopicKeyInput;