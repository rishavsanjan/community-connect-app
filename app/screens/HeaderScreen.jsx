import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Platform } from 'react-native';

export default function HeaderScreen(){
    return(
        <View className="flex justify-between bg-blue-500 flex-col p-4">

          <View className='flex flex-row justify-between mb-6'>
            <Text className="text-white text-2xl font-bold ">
              Community <Text className="text-cyan-400">Connect</Text>
            </Text>
            <View className='flex-row items-center gap-4'>
              <Image
                source={{ uri: "https://img.icons8.com/ios-filled/50/000000/appointment-reminders.png" }}
                className='w-8 h-8'
              />
              <Image
                source={{ uri: "https://img.icons8.com/?size=100&id=34105&format=png&color=000000" }}
                className='w-10 h-10'
              />
            </View>
          </View>

          <View>
            <TextInput placeholder='Search resources here' className='bg-white  text-gray-500 '></TextInput>
          </View>
        </View>
    )
}