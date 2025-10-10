import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ScrollView, ActivityIndicator } from 'react-native';
import { PRIMARY_GREEN_COLOR } from '@/constants/Colors';
import { Note } from '@/app/(tabs)/PeersWorkletDemoScreen';
import { timeAgo } from '@/utils/timeUtils';
import SendIcon from '@/components/SendIcon';
import ImportIcon from '@/components/ImportIcon';

interface Props {
  notes: Note[];
  onAppendNote: (text: string) => Promise<void>;
  onImportNotes: () => Promise<void>;
}

const NotesView = (props: Props): React.ReactElement => {
  const { notes, onAppendNote, onImportNotes } = props;
  
  const [inputText, setInputText] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const handleSend = async (): Promise<void> => {
    if (inputText.trim().length === 0) {
      return;
    }
    
    await onAppendNote(inputText);
    setInputText('');
  };

  const handleImportNotes = async (): Promise<void> => {
    setIsImporting(true);
    try {
      await onImportNotes();
    } catch (error) {
      console.error('Failed to import notes:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const sortedNotes = [...notes].sort((a: Note, b: Note) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a note..."
          placeholderTextColor="#666"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <SendIcon size={20} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.importButton, isImporting && styles.importButtonDisabled]} 
          onPress={handleImportNotes}
          disabled={isImporting}
        >
          {isImporting && <ActivityIndicator size="small" color="#000000" style={styles.spinner} />}
          {!isImporting && <ImportIcon size={20} color="#000000" />}
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.notesContainer} contentContainerStyle={styles.notesContent}>
        {sortedNotes.map((note: Note) => (
          <View key={note.id} style={styles.noteItem}>
            <Text style={styles.noteText}>{note.messageText}</Text>
            <View style={styles.metaContainer}>
              <Text style={styles.noteTime}>
                {timeAgo(new Date(note.createdAt))} • {note.authorId}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default NotesView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  inputContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 12,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minWidth: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    height: 40,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: PRIMARY_GREEN_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    minWidth: 56,
  },
  sendButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '600',
  },
  importButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: PRIMARY_GREEN_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    minWidth: 56,
  },
  importButtonDisabled: {
    opacity: 0.6,
  },
  importButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '600',
  },
  spinner: {
    marginVertical: 2,
  },
  notesContainer: {
    flex: 1,
  },
  notesContent: {
    gap: 8,
  },
  noteItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    padding: 8,
    borderLeftWidth: 2,
    borderLeftColor: PRIMARY_GREEN_COLOR,
  },
  noteText: {
    color: '#FFFFFF',
    fontSize: 13,
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  noteTime: {
    color: '#999999',
    fontSize: 10,
  },
});