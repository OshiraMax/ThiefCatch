import AsyncStorage from '@react-native-async-storage/async-storage';

interface InfoToFloorMapping {
  [key: string]: string;
}

export const channelToFloorMapping: InfoToFloorMapping = {
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

export const showcaseToFloorMapping: InfoToFloorMapping = {
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

export const saveData = async () => {
  try {
    await AsyncStorage.setItem('channelToFloorMapping', JSON.stringify(channelToFloorMapping));
    await AsyncStorage.setItem('showcaseToFloorMapping', JSON.stringify(showcaseToFloorMapping));
  } catch (error) {
    console.error('Error saving data', error);
  }
};

export const loadData = async () => {
  try {
    const channelMappingString = await AsyncStorage.getItem('channelToFloorMapping');
    const showcaseMappingString = await AsyncStorage.getItem('showcaseToFloorMapping');
    
    if (channelMappingString !== null && showcaseMappingString !== null) {
      const channelMapping = JSON.parse(channelMappingString);
      const showcaseMapping = JSON.parse(showcaseMappingString);
    }
  } catch (error) {
    console.error('Error loading data', error);
  }
};
