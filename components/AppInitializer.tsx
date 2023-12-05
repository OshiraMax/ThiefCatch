import React, { ReactNode, useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import { setCustomText } from 'react-native-global-props';

import { channelToFloorMapping, showcaseToFloorMapping } from '../data/AsyncStorage';

interface AppInitializerProps {
    children: ReactNode;
  }

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    async function initialize() {
      await Promise.all([
        loadFonts(),
        loadData(),
        new Promise(resolve => setTimeout(resolve, 1000)) 
      ]);
      setIsReady(true);
    }
  
    initialize();
  }, []);

  const loadFonts = async () => {
    try {
        await Font.loadAsync({
          'Futura Round Demi': require('../assets/fonts/FuturaRoundDemi.ttf'),
        });
        const customTextProps = {
          style: {
            fontFamily: 'Futura Round Demi'
          }
        };
        setCustomText(customTextProps);
      } catch (error) {
        console.error("Ошибка при загрузке шрифтов", error);
      }
  };

  const loadData = async () => {
    try {
        const channelData = await AsyncStorage.getItem('channelToFloorMapping');
        const showcaseData = await AsyncStorage.getItem('showcaseToFloorMapping');
  
        if (!channelData) {
          await AsyncStorage.setItem('channelToFloorMapping', JSON.stringify(channelToFloorMapping));
        }
        if (!showcaseData) {
          await AsyncStorage.setItem('showcaseToFloorMapping', JSON.stringify(showcaseToFloorMapping));
        }
      } catch (error) {
        console.error("Ошибка при сохранении данных", error);
      }
  };

  if (!isReady) {
    return (
        <View style={styles.container}>
          <Image source={require('../assets/splash.png')}/>
        </View>
      );
  }

  return children;
};

export default AppInitializer;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'black',
    },
});
