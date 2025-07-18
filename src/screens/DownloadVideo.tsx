import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Button,
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import NetInfo from '@react-native-community/netinfo';
import {
  getDBConnection,
  createTable,
  saveVideoPath,
} from '../database/DBService';
import {requestStoragePermission} from '../utlis/permissions';
import {StackNavigationProp} from '@react-navigation/stack';
import {FlatList} from 'react-native-gesture-handler';
import {Divider, IconButton} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

type RootStackParamList = {
  DownloadVideo: undefined;
  Downloads: undefined;
  ProtectedVideo: undefined;
};

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'DownloadVideo'>;
};

const DownloadVideo: React.FC<Props> = ({navigation}) => {
  const navigate = useNavigation();
  const [downloadingVideo, setDownloadingVideo] = useState<string | null>(null);
  useEffect(() => {
    async function initDB() {
      const db = await getDBConnection();
      await createTable(db);
    }
    initDB();
  }, []);

  const videoList = [
    {
      name: 'Bunny Video',
      uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
    {
      name: 'Test Video',
      uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    },
    {
      name: 'dummy Video',
      uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
    {
      name: 'Sample Video',
      uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    },
  ];
  const downloadVideo = async (videoUrl: string, fileName: string) => {
    console.log('fileName: ', fileName);
    console.log('videoUrl: ', videoUrl);

    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (!isConnected) {
      Alert.alert(
        'No Internet',
        'You need an active internet connection to download videos.',
      );
      return;
    }

    // Check and request storage permission
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Storage permission is required to download the video.',
      );
      return;
    }

    const {dirs} = RNFetchBlob.fs;
    console.log('dirs: ', dirs);
    const path = `${dirs.DocumentDir}/${fileName.trim()}.mp4`;
    console.log('path: ', path);

    setDownloadingVideo(fileName); // Set the current file as downloading

    RNFetchBlob.config({
      fileCache: true,
      path: path,
    })
      .fetch('GET', videoUrl)
      .progress((received, total) => {
        console.log(`progress: ${Math.floor((received / total) * 100)}%`);
      })
      .then(async res => {
        console.log('Video downloaded to:', res.path());
        const db = await getDBConnection();
        await saveVideoPath(db, fileName, res.path());
        Alert.alert(
          'Download Complete',
          `Video has been downloaded successfully to ${path}`,
        );
      })
      .catch(error => {
        console.error(error);
        Alert.alert(
          'Download Failed',
          'An error occurred while downloading the video.',
        );
      })
      .finally(() => {
        setDownloadingVideo(null); // Reset to null after download
      });
  };

  const renderItem = ({item}: any) => {
    return (
      <TouchableOpacity style={style.itemContainer}>
        <Text>{item.name}</Text>
        {downloadingVideo === item.name ? (
          <ActivityIndicator size="small" color="blue" />
        ) : (
          <IconButton
            icon="download"
            size={22}
            iconColor="grey"
            onPress={() => downloadVideo(item.uri, item.name)}
          />
        )}
        <Divider />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{flex: 1, justifyContent: 'center'}}>
      <FlatList data={videoList} renderItem={renderItem} />

      <Button
        title="go to protected video"
        onPress={() => navigate.navigate('ProtectedVideo')}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('Downloads')}
        style={{
          padding: 15,
          backgroundColor: 'green',
          borderRadius: 10,
          marginTop: 20,
          alignItems: 'center',
        }}>
        <Text style={{color: 'white', fontSize: 16}}>Go to Downloads</Text>
      </TouchableOpacity>
    </View>
    // <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //   {isDownloading ? (
    //     <ActivityIndicator size="large" color="blue" />
    //   ) : (
    //     <TouchableOpacity
    //       onPress={downloadVideo}
    //       style={{ padding: 15, backgroundColor: 'blue', borderRadius: 10 }}
    //     >
    //       <Text style={{ color: 'white', fontSize: 16 }}>Download Video</Text>
    //     </TouchableOpacity>
    //   )}

    //   <TouchableOpacity
    //     onPress={() => navigation.navigate('Downloads')}
    //     style={{
    //       padding: 15,
    //       backgroundColor: 'green',
    //       borderRadius: 10,
    //       marginTop: 20,
    //     }}
    //   >
    //     <Text style={{ color: 'white', fontSize: 16 }}>Go to Downloads</Text>
    //   </TouchableOpacity>
    // </View>
  );
};

export default DownloadVideo;

const style = StyleSheet.create({
  itemContainer: {
    padding: 5,
    backgroundColor: '#f1f1f1',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderColor: 'black',
  },
});
