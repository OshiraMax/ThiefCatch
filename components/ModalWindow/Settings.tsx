import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { observer } from 'mobx-react';

import { globalStore } from '../../data/GlobalStore';

interface ChannelFloorPair {
    channel: string;
    floor: string;
  }

interface InfoToFloorMapping {
    [key: string]: string;
  }

const mappingToArray = (mapping: InfoToFloorMapping): ChannelFloorPair[] => {
    return Object.entries(mapping).map(([channel, floor]) => ({ channel, floor }));
};
  
const arrayToMapping = (array: ChannelFloorPair[]): InfoToFloorMapping => {
    return array.reduce((acc: InfoToFloorMapping, { channel, floor }) => {
      acc[channel] = floor;
      return acc;
    }, {});
};

const Settings: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [localMappingArray, setLocalMappingArray] = useState(mappingToArray(globalStore.channelToFloorMapping));

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
          globalStore.setChannelToFloorMapping(arrayToMapping(localMappingArray));
        }
      };
    
    const handleChange = (index: number, channel: string, floor: string) => {
        const updatedArray = [...localMappingArray];
        updatedArray[index] = { channel, floor };
        setLocalMappingArray(updatedArray);
    };

    return (
        <View style={styles.container}>
            <View style={styles.timeSettings}>
                <Text style={styles.settingLabel}>Точность (сек):</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => globalStore.setTimeAccuracy(Number(text))}
                    value={globalStore.timeAccuracy.toString()}
                    keyboardType="numeric"
                />
            </View>
            <View style={styles.timeSettings}>
                <Text style={styles.settingLabel}>Смещение (сек):</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => globalStore.setTimeShift(Number(text))}
                    value={globalStore.timeShift.toString()}
                    keyboardType="numeric"
                />
            </View>
            <Text>Режим работы приложения</Text>
            <View style={styles.settingsFloor}>
                <View style={styles.text}>
                    <Text>Каналы камер</Text>
                    <ScrollView style={styles.containerFloor}>
                        {localMappingArray.map((item, index) => (
                            <View key={index} style={styles.row}>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.inputFloor}
                                        value={item.channel}
                                        onChangeText={(newChannel) => handleChange(index, newChannel, item.floor)}
                                        editable={isEditing}
                                    />
                                </View>
                                <Text>:</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.inputFloor}
                                        value={item.floor}
                                        onChangeText={(newFloor) => handleChange(index, item.channel, newFloor)}
                                        editable={isEditing}
                                    />
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
                <View style={styles.text}>
                    <Text>Номера витрин</Text>
                    <ScrollView style={styles.containerFloor}>
                        {localMappingArray.map((item, index) => (
                            <View key={index} style={styles.row}>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.inputFloor}
                                        value={item.channel}
                                        onChangeText={(newChannel) => handleChange(index, newChannel, item.floor)}
                                        editable={isEditing}
                                    />
                                </View>
                            <Text>:</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.inputFloor}
                                        value={item.floor}
                                        onChangeText={(newFloor) => handleChange(index, item.channel, newFloor)}
                                        editable={isEditing}
                                    />
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        
            <TouchableOpacity
                    style={styles.button}
                    onPress={handleEditToggle}>
                    <Text style={styles.textStyle}>{isEditing ? "Сохранить" : "Редактировать"}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default observer(Settings);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '90%',
    },
    settingLabel: {
        fontSize: 16,
        padding: 10,
        textAlign: 'left',
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        color: 'black',
        backgroundColor: 'white',
    },
    timeSettings: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
        
    },
    settingsFloor: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        
      },
    containerFloor: {
        flex: 1,
        margin: 10,
      },
    row: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    inputFloor: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        color: '#333',
        width: '100%',
        borderRadius: 5,
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
    inputContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    text: {
        flex: 1,
        width: '50%',
    },
});
