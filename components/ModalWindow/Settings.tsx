import React from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';

import { observer } from 'mobx-react';

import { globalStore } from '../../mobx/GlobalStore';

const Settings: React.FC = () => {
    const { timePeriodSec } = globalStore;

    return (
        <View>
            <View>
                <Text style={styles.settingLabel}>Введите период времени (в секундах):</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => globalStore.setTimePeriodSec(Number(text))}
                    value={timePeriodSec.toString()}
                    keyboardType="numeric"
                />
            </View>

            <ScrollView>
                <Text>Настройки этажей</Text>
            </ScrollView>
        </View>
    );
};

export default observer(Settings);

const styles = StyleSheet.create({
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
});
