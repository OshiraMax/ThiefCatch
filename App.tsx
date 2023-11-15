import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

export default function App() {
  const [fileSelected, setFileSelected] = useState<{ txt: boolean, xls: boolean }>({ txt: false, xls: false });
  const [datesMatch, setDatesMatch] = useState<boolean>(false);
  const [fileReady, setFileReady] = useState<boolean>(false);

  const handleFileSelect = (fileType: 'txt' | 'xls') => {

    setFileSelected({ ...fileSelected, [fileType]: true });
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <View>
          <View style={styles.buttonFile}>
            <TouchableOpacity style={styles.customButton} onPress={() => handleFileSelect('txt')}>
              <Text style={styles.buttonText}>Лог</Text>
              <Text style={styles.buttonText}>открытий</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusContainer}>
            <View style={fileSelected.txt ? styles.statusIndicatorSelected : styles.statusIndicatorNotSelected} />
            <Text style={fileSelected.txt ? styles.statusTextSelected : styles.statusTextNotSelected}>
              {fileSelected.txt ? 'Файл выбран' : 'Файл не выбран'}
            </Text>
          </View>
        </View>

        <View>
          <View style={styles.buttonFile}>
            <TouchableOpacity style={styles.customButton} onPress={() => handleFileSelect('xls')}>
              <Text style={styles.buttonText}>Лог</Text>
              <Text style={styles.buttonText}>Продаж</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusContainer}>
            <View style={fileSelected.xls ? styles.statusIndicatorSelected : styles.statusIndicatorNotSelected} />
            <Text style={fileSelected.xls ? styles.statusTextSelected : styles.statusTextNotSelected}>
              {fileSelected.xls ? 'Файл выбран' : 'Файл не выбран'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={datesMatch ? styles.statusTextSelected : styles.statusTextNotSelected} >
          {datesMatch ? '' : 'Даты не совпадают'}
        </Text>
      </View>

      <View style={styles.startButton}>
        <TouchableOpacity style={styles.customButton} onPress={() => {}}>
          <Text style={styles.buttonText}>Старт</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusTextNotSelected}>
          {fileReady ? 'Готово!' : ''}
        </Text>
      </View>

      <View style={styles.watchButton}>
        <TouchableOpacity style={styles.customButton} onPress={() => {}}>
          <Text style={styles.buttonText}>Посмотреть</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    backgroundColor: '#111111',
  },
  buttonContainer: {
    flex: 4,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: '30%',
  },
  customButton: {
    height: '120%',
    backgroundColor: 'green',
    borderRadius: 10,
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
  },
  buttonFile: {
    flex: 1,
  },
  statusTextSelected: {
    color: 'green',
  },
  statusTextNotSelected: {
    color: 'red',
  },
  statusContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  statusIndicatorSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: 'green',
    marginRight: 5,
  },
  statusIndicatorNotSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    marginRight: 5,
  },
  startButton: {
    flex: 2,
    width: '40%',
    marginVertical: '10%',
    alignSelf: 'center', 
  },
  watchButton: {
    flex: 2,
    width: '40%',
    marginVertical: '10%', 
    paddingBottom: 100, 
    alignSelf: 'center',
  },
});
