import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import Video from 'react-native-video';
import {
  deleteVideoById,
  getDBConnection,
  getDownloadedVideos,
} from '../database/DBService';
import {IconButton} from 'react-native-paper';

interface Video {
  id: number;
  name: string;
  path: string;
}

const Downloads = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  // ✅ Load Downloaded Videos
  const loadVideos = async () => {
    const db = await getDBConnection();
    const savedVideos = await getDownloadedVideos(db);
    setVideos(savedVideos);
  };

  console.log(videos, 'videos');
  console.log(selectedVideo, 'selectedVideo');

  // ✅ Delete Video from DB and Refresh List
  const handleDeleteFromDb = async (id: number) => {
    const db = await getDBConnection();
    await deleteVideoById(db, id);
    Alert.alert('Success', 'Video deleted successfully!');
    loadVideos(); // Reload videos after deletion
  };

  // ✅ Render Video Item
  const renderItem = ({item}: any) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => setSelectedVideo(item.path)}>
      <Text style={styles.itemText}>{item.name}</Text>
      <IconButton
        icon="delete"
        size={20}
        iconColor="red"
        onPress={() => handleDeleteFromDb(item.id)}
      />
    </TouchableOpacity>
  );

  return (
    <View style={{flex: 1, padding: 20}}>
      {selectedVideo ? (
        <View style={styles.videoContainer}>
          <Video
            source={{uri: `file://${selectedVideo}`}}
            style={styles.videoPlayer}
            controls
            resizeMode="contain"
          />
          <TouchableOpacity
            onPress={() => setSelectedVideo(null)}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>Back to Downloads</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>No Downloads Available</Text>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    padding: 5,
    backgroundColor: '#f1f1f1',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: 300,
  },
  backButton: {
    padding: 15,
    backgroundColor: 'red',
    marginTop: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#aaa',
  },
});

export default Downloads;
