import React from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";
import { ThemedButton } from "@/components/themed-button";
import { Feather } from '@expo/vector-icons';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

export default function AppModal({ visible, onClose, title, children }: AppModalProps) {
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} // Android back button
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {title && <Text style={styles.title}>{title}</Text>}
          {children}
          <ThemedButton
            variant='dark'
            tone='border'
            title={
              <Feather name='x' size={20}/>
            }
            onPress={onClose} 
            style={styles.closeButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // semi-transparent background
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 300,
    height: 510,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 24,
    alignItems: "center",
  },
  title: {
    fontFamily: 'Sora',
    fontSize: 20,
    color: '#f5a858',
    marginVertical: 12,
    fontWeight: "bold",
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 35,
    height: 35,
    borderRadius: 14,
  }
});
