import {StatusBar} from "expo-status-bar";
import {Button, FlatList, SafeAreaView, StyleSheet, Text, View} from "react-native";
import {
  addNotificationResponseReceivedListener,
  EventSubscription, getDevicePushTokenAsync, getPermissionsAsync, NotificationPermissionsStatus,
  NotificationResponse, removeNotificationSubscription, requestPermissionsAsync,
  setNotificationHandler
} from "expo-notifications";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export default function App() {
  const [responseLog, _setResponseLog] = useState<(NotificationResponse & {
    reactKey: string,
    eventTime: string,
    pushTime: string,
    previous: boolean
  })[]>([]);
  const addResponseLog = useCallback((response: NotificationResponse) => {
    _setResponseLog((log) => [{
      ...response,
      reactKey: Math.random().toString(),
      eventTime: new Date().toLocaleTimeString(),
      pushTime: new Date(response.notification.date * 1000).toLocaleTimeString(),
      previous: false,
    }, ...log]);
  }, [])
  const [perm, setPerm] = useState<NotificationPermissionsStatus | null>(null);
  useEffect(() => {
    ensureNotificationPermission().then(p => setPerm(p));
  }, []);
  const [responseListener, setResponseListener] = useState<EventSubscription | null>(null);

  const resubscribe = useCallback(() => {
    _setResponseLog((old) => {
      return old.map(v => ({...v, previous: true}));
    })
    setResponseListener((prev) => {
      if (prev) {
        // remove previous listener
        removeNotificationSubscription(prev);
      }
      return addNotificationResponseReceivedListener((response) => {
        addResponseLog(response);
      });
    });
  }, []);
  const stopListening = useCallback(() => {
    setResponseListener((prev) => {
      if (prev) {
        removeNotificationSubscription(prev);
      }
      return null;
    })
  }, [])

  useEffect(() => {
    return stopListening
  }, []);


  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text>Permission: {perm?.status}</Text>
        {!!perm?.status && perm.status !== 'granted' &&
            <Button title="Request Permission" onPress={() => requestPermissionsAsync()}/>
        }
      </View>
      <View>
        <Text>Listening: {responseListener ? 'YES' : 'NO'}</Text>
        <Button title="Start/Restart listening" onPress={resubscribe}/>
        <Button title="Stop listening" onPress={stopListening}/>
        <Button title="Clear log" onPress={() => _setResponseLog([])}/>
      </View>
      <FlatList
        data={responseLog}
        ListHeaderComponent={<Text style={{fontWeight: 600}}>Response Log</Text>}
        ItemSeparatorComponent={() => <View style={{height: 1, backgroundColor: 'black'}}/>}
        renderItem={({item}) => <View style={{opacity: item.previous ? 0.5 : 1}}>
          <Text>Response Time: {item.pushTime}</Text>
          <Text>Event Time: {item.eventTime}</Text>
          <Text>ID: {item.notification.request.identifier}</Text>
          <Text>Title: {item.notification.request.content.title}</Text>
        </View>}
        keyExtractor={item => item.reactKey}
      />
      <StatusBar style="auto"/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

async function ensureNotificationPermission() {
  const e = await getPermissionsAsync();
  if (e.status !== 'granted') {
    return requestPermissionsAsync();
  }
  return e
}