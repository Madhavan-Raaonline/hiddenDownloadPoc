import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import DownloadVideo from './src/screens/DownloadVideo';
import Downloads from './src/screens/Downloads';
import {PaperProvider} from 'react-native-paper';
import ProtectedVideo from './src/screens/ProtectedVideo';

const Stack = createStackNavigator();

const App = () => {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="DownloadVideo"
            component={DownloadVideo}
            options={{title: 'Download Video'}}
          />
          <Stack.Screen
            name="ProtectedVideo"
            component={ProtectedVideo}
            options={{title: 'Protected Video'}}
          />
          <Stack.Screen
            name="Downloads"
            component={Downloads}
            options={{title: 'My Downloads'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
