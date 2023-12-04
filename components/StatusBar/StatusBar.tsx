import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { observer } from 'mobx-react';

import { globalStore } from '../../mobx/GlobalStore';

const StatusBar: React.FC = () => {
  const { 
    statusMessage, 
    statusType,
 } = globalStore;

  return (
    <View style={styles.statusContainer}>
      <Text style={statusType === 'success' ? styles.statusTextSelected : styles.statusTextNotSelected}>
        {statusMessage}
      </Text>
    </View>
  );
};

export default observer(StatusBar);

const styles = StyleSheet.create({
  statusContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  statusTextSelected: {
    color: 'green',
  },
  statusTextNotSelected: {
    color: '#FF7F50',
  },
});
