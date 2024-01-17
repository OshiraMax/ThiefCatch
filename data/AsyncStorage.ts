import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStore } from './GlobalStore';

interface InfoToFloorMapping {
  [key: string]: string;
}

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

export const loadData = async () => {
  try {
    const channelMappingString = await AsyncStorage.getItem('channelToFloorMapping');
    const showcaseMappingString = await AsyncStorage.getItem('showcaseToFloorMapping');
    const timeAccuracyString = await AsyncStorage.getItem('timeAccuracy');
    const timeShiftString = await AsyncStorage.getItem('timeShift');
    
    let channelMapping: InfoToFloorMapping, showcaseMapping: InfoToFloorMapping, timeAccuracy: number, timeShift: number;

    if (channelMappingString) {
      channelMapping = JSON.parse(channelMappingString);
    } else {
      channelMapping = channelToFloorMapping;
      await AsyncStorage.setItem('channelToFloorMapping', JSON.stringify(channelMapping));
    }

    if (showcaseMappingString) {
      showcaseMapping = JSON.parse(showcaseMappingString);
    } else {
      showcaseMapping = showcaseToFloorMapping;
      await AsyncStorage.setItem('showcaseToFloorMapping', JSON.stringify(showcaseMapping));
    }

    if (timeAccuracyString) {
      timeAccuracy = parseInt(timeAccuracyString, 10);
    } else {
      timeAccuracy = 30;
      await AsyncStorage.setItem('timeAccuracy', timeAccuracy.toString());
    }

    if (timeShiftString) {
      timeShift = parseInt(timeShiftString, 10);
    } else {
      timeShift = 0;
      await AsyncStorage.setItem('timeShift', timeShift.toString());
    }

    globalStore.setChannelToFloorMapping(channelMapping);
    globalStore.setShowcaseToFloorMapping(showcaseMapping);
    globalStore.setTimeAccuracy(timeAccuracy);
    globalStore.setTimeShift(timeShift);
  } 
  catch (error) {
    console.error('Error loading data', error);
  }
};
