import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

import { observer } from 'mobx-react';

import { globalStore } from '../../data/GlobalStore';

interface FloorTimeData {
    floor: number;
    time: string;
}

const Results: React.FC = () => {
    const { nonMatchingData, selectedFloor } = globalStore;

    const parseAndSortData = (data: FloorTimeData[]): FloorTimeData[] => {
        return [...data].reverse().sort((a, b) => a.floor - b.floor);
    };

    const handleSelectFloor = (floor: number) => {
        globalStore.setSelectedFloor(floor);
    };

    const uniqueFloors = Array.from(new Set(nonMatchingData.map(item => item.floor))).sort((a, b) => a - b);

    return (
        <View>
            <View style={styles.floorSelectContainer}>
                {uniqueFloors.map((floor) => (
                    <TouchableOpacity key={floor} onPress={() => handleSelectFloor(floor)}>
                        <Text style={floor === selectedFloor ? styles.activeFloorSelectText : styles.floorSelectText}>{floor}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => globalStore.setSelectedFloor(null)}>
                    <Text style={selectedFloor === null ? styles.activeFloorSelectText : styles.floorSelectText}>Все</Text>
                </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
                {parseAndSortData(nonMatchingData)
                .filter(item => selectedFloor === null || item.floor === selectedFloor)
                .map((item, index) => (
                    <Text key={`${item.floor}-${item.time}-${index}`} style={styles.modalText}>
                    {item.floor} этаж {item.time}
                    </Text>
                ))}
            </ScrollView>
        </View>
    );
};

export default observer(Results);

const styles = StyleSheet.create({
    floorSelectContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 10,
    },
    floorSelectText: {
        marginHorizontal: 5,
        marginBottom: 10,
        padding: 5,
        backgroundColor: 'green',
        borderRadius: 50,
        color: 'white',
    },
    activeFloorSelectText: {
        marginHorizontal: 5,
        marginBottom: 10,
        padding: 5,
        backgroundColor: '#FF7F50', // Выбран активный цвет
        borderRadius: 50,
        color: 'white',
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 18,
    },
});
