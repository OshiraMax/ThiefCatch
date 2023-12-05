import { Alert } from 'react-native';

import { globalStore } from '../data/GlobalStore';
import updateStatusBar from './StatusBar/updateStatusBar';

const parseTimeToMilliseconds = (timeStr: string): number => {
  const parts = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
  return date.getTime();
};

const findNonMatchingEvents = (parsedEvents: string[], processedData: string[]) => {
  const timePeriod: number = (globalStore.timePeriodSec+30) * 1000;

  return parsedEvents.filter(parsedEvent => {
    const [parsedFloor, parsedTime] = parsedEvent.split(' ');
    const parsedTimeInMs = parseTimeToMilliseconds(parsedTime);

    return !processedData.some(processedEvent => {
      const [processedFloor, processedTime] = processedEvent.split(' ');
      const processedTimeInMs = parseTimeToMilliseconds(processedTime);

      return parsedFloor === processedFloor && Math.abs(parsedTimeInMs - processedTimeInMs) <= timePeriod;
    });
  });
};

export const compareData = () => {
  const { 
    fileReady, 
    parsedEvents, 
    processedData, 
    fileSelected, 
    datesMatch 
} = globalStore;

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
              globalStore.setFileReady(false);
              globalStore.setProcessedData([]);
              globalStore.setTxtDate('');
              globalStore.setXlsxDate('');
              globalStore.setFileSelected({ txt: false, xlsx: false });
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
    globalStore.setNonMatchingData(nonMatchingEvents);
    globalStore.setFileReady(true);
    globalStore.setSelectedFloor(null);
    updateStatusBar('Готово!', 'success');
  } else if (!fileSelected.txt) {
    updateStatusBar('Файл txt не выбран', 'error', 3000);
  } else if (!fileSelected.xlsx) {
    updateStatusBar('Файл xlsx не выбран', 'error', 3000);
  } else if (!datesMatch) {
    updateStatusBar('Даты не совпадают', 'error', 3000);
  }
};

