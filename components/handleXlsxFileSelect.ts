import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';

import { globalStore } from '../data/GlobalStore';

interface ExcelDataRow {
  'Номер витрины': number;
  'Дата создания': string;
  'Оплачен': string;
}

export const handleXlsxFileSelect = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      globalStore.setFileReady(false);
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });

      const workbook = XLSX.read(fileContent, { type: 'base64' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: ExcelDataRow[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      globalStore.setXlsxDate(extractDateFromXlsx(json));
      globalStore.setFileSelected({ txt: globalStore.fileSelected.txt, xlsx: true });

      const processedData = json.filter(row => row['Оплачен'] === 'Да').map(row => {
        const floor = globalStore.showcaseToFloorMapping[row['Номер витрины'].toString()];
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
      globalStore.setProcessedData(processedData);
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
