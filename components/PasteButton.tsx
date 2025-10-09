import * as React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import PasteIcon from '@/components/PasteIcon';
import { PRIMARY_GREEN_COLOR } from '@/constants/Colors';

interface Props {
  onPress: () => void;
  size?: number;
  color?: string;
}

const PasteButton = (props: Props): React.ReactElement => {
  const { onPress, size = 16, color = PRIMARY_GREEN_COLOR } = props;
  const [label, setLabel] = React.useState<string>('Paste');

  const handlePress = (): void => {
    onPress();
    setLabel('Pasted');
    setTimeout(() => {
      setLabel('Paste');
    }, 2000);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.button}>
      <View style={styles.content}>
        <PasteIcon size={size} color={color} />
        <Text style={[styles.text, { color }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default PasteButton;

const styles = StyleSheet.create({
  button: {
    padding: 6,
    borderWidth: 1,
    borderColor: PRIMARY_GREEN_COLOR,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});