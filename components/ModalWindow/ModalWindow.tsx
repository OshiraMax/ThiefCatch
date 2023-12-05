import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';

import { observer } from 'mobx-react';

import { globalStore } from '../../data/GlobalStore';
import Results from './Results';
import Settings from './Settings';

const ModalWindow: React.FC = () => {
    const { isModalVisible, modalContent } = globalStore;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => globalStore.setIsModalVisible(!isModalVisible)}
        >
            <View style={styles.modalView}>
                {modalContent === 'results' && <Results />}
                {modalContent === 'settings' && <Settings />}
            </View>
        </Modal>
    );
};

export default observer(ModalWindow);

const styles = StyleSheet.create({
    modalView: {
        height: "95%",
        margin: 20,
        marginBottom: 60,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
});
