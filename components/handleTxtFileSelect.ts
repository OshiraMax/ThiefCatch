import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { globalStore } from '../data/GlobalStore';
import { showcaseToFloorMapping } from '../data/AsyncStorage';

interface InfoToFloorMapping {
    [key: string]: string;
  }

export const handleTxtFileSelect = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'text/plain',
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      globalStore.setFileReady(false);
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);

      const mappingString = await AsyncStorage.getItem('channelToFloorMapping');
      const channelToFloorMapping: InfoToFloorMapping = mappingString ? JSON.parse(mappingString) : {};
      console.log(channelToFloorMapping);

      const { parsedEvents, startDate } = parseTxtFile(fileContent, channelToFloorMapping);
      globalStore.setParsedEvents(parsedEvents);
      globalStore.setTxtDate(startDate);
      globalStore.setFileSelected({ txt: true, xlsx: globalStore.fileSelected.xlsx });
    } else {
      console.log('Выбор файла отменен');
    }
  } catch (error) {
    console.error('Ошибка при выборе файла:', error);
  }
};

const parseTxtFile = (fileContent: string, channelToFloorMapping: InfoToFloorMapping): { parsedEvents: string[], startDate: string } => {
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

