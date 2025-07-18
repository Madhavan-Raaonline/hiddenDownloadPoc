import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = 'VideoDB.db';

// ✅ Open Database Connection
export const getDBConnection = async () => {
  return SQLite.openDatabase({
    name: database_name,
    location: 'default', // Use 'Library' if preferred for Android
  });
};

// ✅ Create Table
export const createTable = async (db: any) => {
  const query = `
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL
    );
  `;
  await db.executeSql(query);
};

// ✅ Save Video Path
export const saveVideoPath = async (db: any, name: string, path: string) => {
  const insertQuery = `INSERT INTO videos (name, path) VALUES (?, ?);`;
  await db.executeSql(insertQuery, [name, path]);
};

// ✅ Get Downloaded Videos
export const getDownloadedVideos = async (db: any) => {
  const videos: any[] = [];
  const results = await db.executeSql('SELECT * FROM videos;');
  results.forEach((resultSet: any) => {
    for (let i = 0; i < resultSet.rows.length; i++) {
      videos.push(resultSet.rows.item(i));
    }
  });
  return videos;
};

// ✅ Delete Video by ID
export const deleteVideoById = async (db: any, id: number) => {
  const deleteQuery = `DELETE FROM videos WHERE id = ?;`;
  await db.executeSql(deleteQuery, [id]);
};