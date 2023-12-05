import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text} from 'react-native';

import { observer } from 'mobx-react';
import Icon from 'react-native-vector-icons/FontAwesome';

import { globalStore } from './data/GlobalStore';
import { handleTxtFileSelect } from './components/handleTxtFileSelect';
import { handleXlsxFileSelect } from './components/handleXlsxFileSelect';
import { compareData } from './components/compareData';
import ModalWindow from './components/ModalWindow/ModalWindow';
import StatusBar from './components/StatusBar/StatusBar';
import updateStatusBar from './components/StatusBar/updateStatusBar';
import AppInitializer from './components/AppInitializer';


type ModalContentType = 'results' | 'settings';

const App: React.FC = () => {
  const {
    fileSelected,
    fileReady,
    txtDate,
    xlsxDate,
  } = globalStore;

  useEffect(() => {
    if (txtDate && xlsxDate) {
      globalStore.setDatesMatch(txtDate === xlsxDate);
      if (txtDate !== xlsxDate) {
        updateStatusBar('Даты не совпадают', 'error', 3000);
      }
    }
  }, [txtDate, xlsxDate]);

  const viewResult = () => {
    if (fileReady) {
      handleShowModal('results');
    } else {
      updateStatusBar('Файлы не обработаны', 'error', 3000);
    }
  }
                      
  const handleSettingsPress = () => {
    handleShowModal('settings');
  }

  const handleShowModal = (content: ModalContentType) => {
    globalStore.setModalContent(content);
    globalStore.setIsModalVisible(true);
  };

  return (
    <AppInitializer>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <View>
            <View style={styles.buttonFile}>
              <TouchableOpacity style={styles.customButton} onPress={() => handleTxtFileSelect()}>
                <Text style={styles.buttonText}>Лог</Text>
                <Text style={styles.buttonText}>открытий</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statusContainer}>
              <View style={fileSelected.txt ? styles.statusIndicatorSelected : styles.statusIndicatorNotSelected} />
              <Text style={fileSelected.txt ? styles.statusTextSelected : styles.statusTextNotSelected}>
                {fileSelected.txt ? txtDate : 'Файл не выбран'}
              </Text>
            </View>
          </View>

          <View>
            <View style={styles.buttonFile}>
              <TouchableOpacity style={styles.customButton} onPress={() => handleXlsxFileSelect()}>
                <Text style={styles.buttonText}>Лог</Text>
                <Text style={styles.buttonText}>Продаж</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statusContainer}>
              <View style={fileSelected.xlsx ? styles.statusIndicatorSelected : styles.statusIndicatorNotSelected} />
              <Text style={fileSelected.xlsx ? styles.statusTextSelected : styles.statusTextNotSelected}>
                {fileSelected.xlsx ? xlsxDate : 'Файл не выбран'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.startButton} >
          <TouchableOpacity 
            style={[
              styles.customButton, 
              { backgroundColor: fileReady ? '#FF7F50' : 'green' }
            ]} 
            onPress={() => compareData()}>
              <Text style={styles.buttonText}>{fileReady ? 'Сброс' : 'Старт'} </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.watchButton}>
          <TouchableOpacity style={styles.customButton} onPress={() => viewResult()}>
            <Text style={styles.buttonText}>Посмотреть</Text>
          </TouchableOpacity>
        </View>

        <StatusBar />

        <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
          <Icon name="gear" size={30} color="#fff" />
        </TouchableOpacity>

        <ModalWindow />
      </View>
    </AppInitializer>
  );
};

export default observer(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 30,
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#fff', // Цвет тени
    shadowOffset: { width: 0, height: 4 }, // Направление и величина тени
    shadowOpacity: 0.3, // Прозрачность тени
    shadowRadius: 30, // Радиус размытия тени
    elevation: 30, // Высота тени для Android
    borderWidth: 1, // Толщина границы
    borderColor: '#000', // Цвет границы
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
  buttonFile: {
    flex: 1,
    width: 130,
  },
  statusTextSelected: {
    color: 'green',
  },
  statusTextNotSelected: {
    color: '#FF7F50',
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
    backgroundColor: '#FF7F50',
    marginRight: 5,
  },
  startButton: {
    flex: 2,
    width: '40%',
    marginVertical: '10%',
    alignSelf: 'center', 
  },
  resetButton: {
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
  settingsButton: {
    position: 'absolute',
    bottom: 25, // Или другое значение для позиционирования
    right: 25, // Или другое значение для позиционирования
  },
});
