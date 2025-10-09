import * as React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { INPUT_BACKGROUND_COLOR, PRIMARY_GREEN_COLOR, PLACEHOLDER_COLOR } from '@/constants/Colors';
import PasteButton from '@/components/PasteButton';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

const TopicKeyInput = (props: Props): React.ReactElement => {
  const { value, onChangeText } = props;

  const handlePaste = async (): Promise<void> => {
    const clipboardContent = await Clipboard.getStringAsync();
    onChangeText(clipboardContent);
  };

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
      <PasteButton onPress={handlePaste} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BACKGROUND_COLOR,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: PRIMARY_GREEN_COLOR,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 13,
    color: PRIMARY_GREEN_COLOR,
  },
});

export default TopicKeyInput;