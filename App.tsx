import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, ScrollView} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';

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

export default function App() {
  const [fileSelected, setFileSelected] = useState<{ txt: boolean, xlsx: boolean }>({ txt: false, xlsx: false });
  const [datesMatch, setDatesMatch] = useState<boolean>(false);
  const [fileReady, setFileReady] = useState<boolean>(true);
  const [parsedEvents, setParsedEvents] = useState<string[]>([]);
  const [processedData, setProcessedData] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nonMatchingData, setNonMatchingData] = useState<string[]>([]);

  const handleFileSelect = async (fileType: 'txt' | 'xlsx') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: fileType === 'txt' ? 'text/plain' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri, 
          fileType === 'txt' ? undefined : { encoding: FileSystem.EncodingType.Base64 }
        );

        if (fileType === 'txt') {
          const parsedEvents = parseTxtFile(fileContent);
          setParsedEvents(parsedEvents);
          console.log(parsedEvents);
        } else if (fileType === 'xlsx') {
          const workbook = XLSX.read(fileContent, { type: 'base64' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json: ExcelDataRow[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

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
          console.log(processedData);
        }

        setFileSelected({ ...fileSelected, [fileType]: true });
      } else {
        console.log('Выбор файла отменен');
      }
    } catch (error) {
      console.error('Ошибка при выборе файла:', error);
    }
  }; 

  const parseTxtFile = (fileContent: string) => {
    const events = fileContent.split('Дата').filter(event => 
      event.includes('Начало события') && event.includes('Тип события:Локальная тревога')
    );
    return events.map(event => {
      const lines = event.split('\n');
      const channelLine = lines.find(line => line.startsWith('Канал:'));
      const startTimeLine = lines.find(line => line.startsWith('Начало:'));
      
      const channel = channelLine ? channelLine.split(':')[1].trim() : '';
      const startTime = startTimeLine ? startTimeLine.split(' ')[1].trim() : '';
  
      const floor = channelToFloorMapping[channel];
      return floor ? `${floor} ${startTime}` : null;
    }).filter(event => event !== null) as string[]; 
  };

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
    '854': '20',
    '669': '21',
    '670': '22',
    '671': '23',
    '672': '24',
    '673': '25',
    '674': '26',
  };

  const timePeriod = 60 * 1000;

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
  
      return !processedData.some(processedEvent => {
        const [processedFloor, processedTime] = processedEvent.split(' ');
        const processedTimeInMs = parseTimeToMilliseconds(processedTime);
  
      return parsedFloor === processedFloor && Math.abs(parsedTimeInMs - processedTimeInMs) <= timePeriod;
      });
    });
  
    return nonMatchingEvents;
  };
  
  const compareData = () => {
    const nonMatchingEvents = findNonMatchingEvents(parsedEvents, processedData);
    setNonMatchingData(nonMatchingEvents);
  };

  const parseAndSortData = (data: string[]): FloorTimeData[] => {
    const parsedData = data.map(item => {
      const [floor, time] = item.split(' ');
      return { floor: parseInt(floor, 10), time };
    });
    
    parsedData.reverse();
    parsedData.sort((a, b) => a.floor - b.floor);
  
    return parsedData;
  }

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
            <TouchableOpacity style={styles.customButton} onPress={() => handleFileSelect('xlsx')}>
              <Text style={styles.buttonText}>Лог</Text>
              <Text style={styles.buttonText}>Продаж</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusContainer}>
            <View style={fileSelected.xlsx ? styles.statusIndicatorSelected : styles.statusIndicatorNotSelected} />
            <Text style={fileSelected.xlsx ? styles.statusTextSelected : styles.statusTextNotSelected}>
              {fileSelected.xlsx ? 'Файл выбран' : 'Файл не выбран'}
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
        <TouchableOpacity style={styles.customButton} onPress={() => compareData()}>
          <Text style={styles.buttonText}>Старт</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusTextNotSelected}>
          {fileReady ? 'Готово!' : ''}
        </Text>
      </View>

      <View style={styles.watchButton}>
        <TouchableOpacity style={styles.customButton} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.buttonText}>Посмотреть</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(!isModalVisible);
        }}>
        <View style={styles.modalView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {parseAndSortData(nonMatchingData).map((item, index) => (
              <Text key={index} style={styles.modalText}>
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
    borderRadius: 10,
    justifyContent: 'center', 
    alignItems: 'center', 
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
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
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
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
});
