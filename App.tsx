import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Modal, ScrollView, Alert} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import * as Font from 'expo-font';

import Icon from 'react-native-vector-icons/FontAwesome';
import { setCustomText } from 'react-native-global-props';

interface ExcelDataRow {
  'Номер витрины': number;
  'Дата создания': string;
  'Оплачен': string;
}

interface InfoToFloorMapping {
  [key: string]: string;
}

interface FloorTimeData {
  floor: number;
  time: string;
}

type StatusType = 'error' | 'success';
type ModalContentType = 'results' | 'settings';

export default function App() {
  const [fileSelected, setFileSelected] = useState<{ txt: boolean, xlsx: boolean }>({ txt: false, xlsx: false });
  const [datesMatch, setDatesMatch] = useState<boolean>(true);
  const [fileReady, setFileReady] = useState<boolean>(false);
  const [parsedEvents, setParsedEvents] = useState<string[]>([]);
  const [processedData, setProcessedData] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nonMatchingData, setNonMatchingData] = useState<FloorTimeData[]>([]);
  const [txtDate, setTxtDate] = useState<string>('');
  const [xlsxDate, setXlsxDate] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<StatusType>('success');
  const [statusTimeoutId, setStatusTimeoutId] = useState<number | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ModalContentType>('results');
  const [timePeriodSec, setTimePeriodSec] = useState<number>(60);


  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Futura Round Demi': require('./assets/fonts/FuturaRoundDemi.ttf'),
        });
        setFontsLoaded(true);
        const customTextProps = {
          style: {
            fontFamily: 'Futura Round Demi'
          }
        };
        
        setCustomText(customTextProps);
      } catch (error) {
        console.error("Ошибка при загрузке шрифтов", error);
      }
    }
    loadFonts();
  }, []);


  const handleFileSelect = async (fileType: 'txt' | 'xlsx') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: fileType === 'txt' ? 'text/plain' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setFileReady(false);
        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri, 
          fileType === 'txt' ? undefined : { encoding: FileSystem.EncodingType.Base64 }
        );

      if (fileType === 'txt') {
        const { parsedEvents, startDate } = parseTxtFile(fileContent);
        setParsedEvents(parsedEvents);
        setTxtDate(startDate); 
      } 
        
      if (fileType === 'xlsx') {
        const workbook = XLSX.read(fileContent, { type: 'base64' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: ExcelDataRow[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        setXlsxDate(extractDateFromXlsx(json));

        const processedData = json.filter(row => row['Оплачен'] === 'Да').map(row => {
          const floor = showcaseToFloorMapping[row['Номер витрины'].toString()];
          if (!floor) return null;  // Исключаем строки с номерами витрин, которых нет в маппинге
          
          const date = parseDateString(row['Дата создания']);
          if (date) {
            const hours = formatTimePart(date.getHours());
            const minutes = formatTimePart(date.getMinutes());
            const seconds = formatTimePart(date.getSeconds());
            const formattedDate = `${hours}:${minutes}:${seconds}`;
            return `${floor} ${formattedDate}`;
          } else {
            return null; 
          }
        }).filter(row => row !== null) as string[];
        setProcessedData(processedData);
      }

      setFileSelected({ ...fileSelected, [fileType]: true });
      
      } else {
        console.log('Выбор файла отменен');
      }
    } catch (error) {
      console.error('Ошибка при выборе файла:', error);
    }
  }; 

  const extractDateFromXlsx = (json: ExcelDataRow[]): string => {
    if (json.length > 0 && json[0]['Дата создания']) {
      const dateTime = json[0]['Дата создания'].trim();
      const datePart = dateTime.split(' ')[0]; // Получаем только дату
      return datePart;
    }
    return '';
  };

  const parseTxtFile = (fileContent: string): { parsedEvents: string[], startDate: string } => {
    const events = fileContent.split('Дата').filter(event => 
      event.includes('Начало события') && event.includes('Тип события:Локальная тревога')
    );
    const parsedEvents = events.map(event => {
      const lines = event.split('\n');
      const channelLine = lines.find(line => line.startsWith('Канал:'));
      const startTimeLine = lines.find(line => line.startsWith('Начало:'));
      
      const channel = channelLine ? channelLine.split(':')[1].trim() : '';
      const startTime = startTimeLine ? startTimeLine.split(' ')[1].trim() : '';
  
      const floor = channelToFloorMapping[channel];
      return floor ? `${floor} ${startTime}` : null;
    }).filter(event => event !== null) as string[]; 

    const startDateLine = fileContent.split('\n').find(line => line.includes('Дата:'));
    let startDate = startDateLine ? startDateLine.split('Дата:')[1].trim() : '';

    if (startDate) {
      const dateParts = startDate.split(' ')[0].split('-'); // Разделяем дату и время, затем дату на компоненты
      startDate = [dateParts[2], dateParts[1], dateParts[0]].join('.'); // Объединяем компоненты даты без разделителей 
    }

    return { parsedEvents, startDate };  
  };

  useEffect(() => {
    if (txtDate && xlsxDate) {
      setDatesMatch(txtDate === xlsxDate);
      if (txtDate != xlsxDate){
        updateStatusBar('Даты не совпадают', 'error', 3000);
      }

    }
  }, [txtDate, xlsxDate]);

  const timePeriod = timePeriodSec * 1000;

  const parseDateString = (dateStr: string): Date | null => {
    const dateTimeParts = dateStr.split(' ');
    if (dateTimeParts.length !== 2) return null;
  
    const dateParts = dateTimeParts[0].split('.');
    const timeParts = dateTimeParts[1].split(':');
    if (dateParts.length !== 3 || timeParts.length !== 3) return null;
  
    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; 
    const year = parseInt(dateParts[2]);
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const seconds = parseInt(timeParts[2]);
  
    const date = new Date(year, month, day, hours, minutes, seconds);
    return isNaN(date.getTime()) ? null : date;
  };

  const formatTimePart = (value: number): string => {
    return value.toString().padStart(2, '0');
  };

  const channelToFloorMapping: InfoToFloorMapping = {
    '1': '22',
    '2': '23',
    '3': '20',
    '4': '20',
    '5': '26',
    '6': '21',
    '7': '19',
    '8': '25',
    '9': '24',
    '10': '19',
    '11': '23',
    '12': '24',
    '13': '26',
  };

  const showcaseToFloorMapping: InfoToFloorMapping = {
    '667': '19',
    '668': '20',
    '669': '21',
    '670': '22',
    '671': '23',
    '672': '24',
    '673': '25',
    '674': '26',
    '854': '20',
  };

  const parseTimeToMilliseconds = (timeStr: string): number => {
    const parts = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
    return date.getTime();
  };

  const findNonMatchingEvents = (parsedEvents: string[], processedData: string[]) => {
    const nonMatchingEvents = parsedEvents.filter(parsedEvent => {
      const [parsedFloor, parsedTime] = parsedEvent.split(' ');
      const parsedTimeInMs = parseTimeToMilliseconds(parsedTime);
      setFileReady(true);
  
      return !processedData.some(processedEvent => {
        const [processedFloor, processedTime] = processedEvent.split(' ');
        const processedTimeInMs = parseTimeToMilliseconds(processedTime);
  
      return parsedFloor === processedFloor && Math.abs(parsedTimeInMs - processedTimeInMs) <= timePeriod;
      });
    });
  
    return nonMatchingEvents;
  };
  
  const compareData = () => {
    if (fileReady) {
      Alert.alert(
        "Подтверждение", // Заголовок
        "Вы уверены?", // Сообщение
        [
          {
            text: "Нет",
            onPress: () => console.log("Отмена"),
            style: "cancel"
          },
          { 
            text: "Да", 
            onPress: () => {
              setFileReady(false);
              setProcessedData([]);
              setTxtDate('');
              setXlsxDate('');
              setFileSelected({ txt: false, xlsx: false });
              updateStatusBar('');
              return;
            }
          }
        ],
        { cancelable: true }
      );
    }
    if (datesMatch && fileSelected.txt && fileSelected.xlsx) {
      const nonMatchingEvents = findNonMatchingEvents(parsedEvents, processedData).map(event => {
        const [floorStr, time] = event.split(' ');
        return { floor: parseInt(floorStr, 10), time };
      });;
      setNonMatchingData(nonMatchingEvents);
      updateStatusBar('Готово!', 'success');
    } else if (!fileSelected.txt) {
      updateStatusBar('Файл txt не выбран', 'error', 3000);
    } else if (!fileSelected.xlsx) {
      updateStatusBar('Файл xlsx не выбран', 'error', 3000);
    } else if (!datesMatch) {
      updateStatusBar('Даты не совпадают', 'error', 3000);
    }
  };

  const parseAndSortData = (data: FloorTimeData[]): FloorTimeData[] => {
    
    return [...data].reverse().sort((a, b) => a.floor - b.floor);
  }
  const viewResult = () => {
    if (fileReady) {
      handleShowModal('results');
    } else {
      updateStatusBar('Файлы не обработаны', 'error', 3000);
    }
  }

  const updateStatusBar = (message: string, type: StatusType = 'success', duration: number = Infinity) => {
    if (statusTimeoutId !== null) {
      clearTimeout(statusTimeoutId);
    }

    setStatusMessage(message);
    setStatusType(type);
  
    if (duration !== Infinity) {
      const id = setTimeout(() => {
        setStatusMessage('');
      }, duration) as unknown as number;
      setStatusTimeoutId(id);
    }
  };

  const handleSelectFloor = (floor: number) => {
    setSelectedFloor(floor);
  };

  const uniqueFloors = Array.from(new Set(nonMatchingData.map(item => item.floor))).sort((a, b) => a - b);
                      
  const handleSettingsPress = () => {
    handleShowModal('settings');
  }
  const handleShowModal = (content: ModalContentType) => {
    setModalContent(content);
    setIsModalVisible(true);
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
              {fileSelected.txt ? txtDate : 'Файл не выбран'}
            </Text>
          </View>
        </View>

        <View>
          <View style={styles.buttonFile}>
            <TouchableOpacity style={styles.customButton} onPress={() => handleFileSelect('xlsx')}>
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

      <View style={styles.statusContainer}>
      <Text style={statusType === 'success' ? styles.statusTextSelected : styles.statusTextNotSelected }>
          {statusMessage}
        </Text>
      </View>

      <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
        <Icon name="gear" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(!isModalVisible);
        }}>
        <View style={styles.modalView}>
          {modalContent === 'results' && (
            <View>
              <View style={styles.floorSelectContainer}>
                {uniqueFloors.map((floor) => (
                  <TouchableOpacity key={floor} onPress={() => handleSelectFloor(floor)}>
                    <Text style={styles.floorSelectText}>{floor}</Text>
                  </TouchableOpacity>
                ))}
                  <TouchableOpacity onPress={() => setSelectedFloor(null)}>
                    <Text style={styles.floorSelectText}>Все</Text>
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
            
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setIsModalVisible(!isModalVisible)}>
                <Text style={styles.textStyle}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          )}

          {modalContent === 'settings' && (
            <View>
              <View>
                <Text>Введите период времени:</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => setTimePeriodSec(Number(text))}
                  value={timePeriodSec.toString()}
                  keyboardType="numeric"
                />
              </View>
              <ScrollView>
                <Text>Настройки этажей</Text>
              </ScrollView>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setIsModalVisible(!isModalVisible)}>
                <Text style={styles.textStyle}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

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
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  button: {
    marginTop: 15,
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  floorSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
  },
  floorSelectText: {
      // Пример стиля для текста на кнопках выбора этажа
    marginHorizontal: 5,
    marginBottom: 10,
    padding: 5,
    backgroundColor: 'green',
    borderRadius: 50,
    color: 'white',
  },
  settingsButton: {
    position: 'absolute',
    bottom: 25, // Или другое значение для позиционирования
    right: 25, // Или другое значение для позиционирования
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
