import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text } from 'react-native';

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

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => globalStore.setIsModalVisible(!isModalVisible)}>
                    <Text style={styles.textStyle}>Закрыть</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

export default observer(ModalWindow);

const styles = StyleSheet.create({
    modalView: {
        flex: 1,
        height: "95%",
        margin: 20,
        backgroundColor: "white",
        borderRadius: 30,
        padding: 15,
        justifyContent: 'space-between',
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
    button: {
        marginTop: 15,
        borderRadius: 20,
        padding: 10,
        paddingHorizontal: 50,
        elevation: 2,
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
});
