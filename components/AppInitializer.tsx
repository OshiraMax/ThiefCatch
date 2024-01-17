import React, { ReactNode, useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import * as Font from 'expo-font';
import { setCustomText } from 'react-native-global-props';
import { loadData } from '../data/AsyncStorage';

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

  if (!isReady) {
    return (
        <View style={styles.container}>
          <Image source={require('../assets/splash.png')} resizeMode="contain" />
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
