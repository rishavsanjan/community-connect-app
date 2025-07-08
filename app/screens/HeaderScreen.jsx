import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Text, TouchableOpacity, View, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Platform } from 'react-native';

export default function HeaderScreen({ navigation }) {

  const [searchDropDown, setSearchDropDown] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const searchRef = useRef(null);


  const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';



  const fetchSearchResults = useCallback(async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }
    const resposne = await fetch(`${baseURL}/searchusers?q=${query}`);
    const data = await resposne.json();
    setUsers(data);
  }, [])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSearchResults(query);
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query, fetchSearchResults])




  return (
    <TouchableWithoutFeedback onPress={() => { setSearchDropDown(false); }}>
      <View style={{  zIndex: 10 }}>
        <View className="flex justify-between bg-blue-500 flex-col p-4">
          <View className="flex flex-row justify-between mb-6">
            <Text className="text-white text-2xl font-bold">
              <Text className="text-cyan-400">Community Connect</Text>
            </Text>
          </View>

          <View>
            <TextInput
              ref={searchRef}
              activeUnderlineColor="transparent"
              onChangeText={(text) => {
                setQuery(text);
                setSearchDropDown(true);
              }}
              placeholder="Search resources here"
              className="bg-white text-gray-500"
            />
          </View>
        </View>

        {searchDropDown && (
          <View className="flex flex-col items-center gap-8 pt-4 bg-white absolute top-36 left-4 w-72 rounded-sm h-auto">
            {users.map((obj) => (
              <TouchableOpacity onPress={() => { navigation.navigate('UserInfo', { id: obj._id }); console.log(obj._id) }} className="w-full items-center" key={obj._id}>
                <TouchableOpacity className="flex flex-row items-center gap-4">
                  <Image
                    className="w-8 h-8"
                    source={{
                      uri: 'https://img.icons8.com/?size=100&id=7819&format=png&color=000000',
                    }}
                  />
                  <Text>{obj.firstName + ' ' + obj.lastName}</Text>
                </TouchableOpacity>
                <View className="border border-gray-200 w-full mt-4" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );

}