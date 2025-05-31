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
          </View>

          <View>
            <TextInput placeholder='Search resources here' className='bg-white  text-gray-500 '></TextInput>
          </View>
        </View>
    )
}