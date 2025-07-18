import React from 'react';
import {Alert} from 'react-native';
import {WebView} from 'react-native-webview';
import RNFS from 'react-native-fs';
import {requestStoragePermission} from '../utlis/permissions';

const ProtectedVideo = () => {
  const downloadVideo = async (url: string) => {
    console.log('url: ', url);
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to download the video.',
        );
        return;
      }

      const filename = url.split('/').pop()?.split('?')[0] || 'video.mp4';
      console.log('filename: ', filename);
      const destPath = `${RNFS.DownloadDirectoryPath}/${filename}`;
      console.log('destPath: ', destPath);

      const downloadOptions = {
        fromUrl: url,
        toFile: destPath,
        headers: {
          Referer: 'https://devapi.raaonline.in/',
        },
      };

      const result = await RNFS.downloadFile(downloadOptions).promise;
      console.log('result: ', result);

      if (result.statusCode === 200) {
        Alert.alert('Download complete', `Saved to: ${destPath}`);
      } else {
        Alert.alert('Download failed', `Status code: ${result.statusCode}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download failed', 'An error occurred');
    }
  };

  // const handleNavigation = (event: any) => {
  //   console.log('event: ', event);
  //   const url = event.url;
  //   if (url.includes('/play_720p.mp4')) {
  //     // Intercept download link
  //     downloadVideo(url);
  //     return false; // Prevent WebView navigation
  //   }
  //   return true; // Allow other links
  // };

  // const onMessage = event => {
  //   console.log('Message from WebView:', event.nativeEvent.data);
  //   // Handle data from the web page here
  // };

  return (
    <WebView
      originWhitelist={['*']}
      source={{
        uri: 'https://devapi.raaonline.in/api/v1/videos/downloadVideo?id=9fc1e86c-1f2c-400a-b7f8-1edff159caa8',
      }}
      javaScriptEnabled={true}
      onMessage={event => {
        console.log('event data:', event.nativeEvent.data);
        const message = JSON.parse(event.nativeEvent.data);
        console.log('message: ', message);
        console.log('message: ', message?.url);

        if (message?.url) {
          downloadVideo(message.url);
        }
      }}
    />
  );
};

export default ProtectedVideo;
