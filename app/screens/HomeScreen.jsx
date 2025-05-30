import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Platform } from 'react-native';


export default function HomeScreen({navigation}) {
  const [resource, setResource] = useState([]);
  const baseURL = Platform.OS === 'android'? 'http://10.0.2.2:5000': 'http://localhost:5000';


  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await fetch(`${baseURL}/resourcerequest`);
        const data = await response.json();

        const response2 = await fetch(`${baseURL}/resourceupload`);
        const data2 = await response2.json();
        const combined = ([...data.todo, ...data2.todo]);

        const priorityOrder = { 'High Priority': 1, 'Medium Priority': 2, 'Low Priority': 3 };

        const sortedResources = combined.sort((a, b) => {
          return priorityOrder[a.resourcePriority] - priorityOrder[b.resourcePriority];
        });

        const top3 = sortedResources.slice(0, 3);
        setResource(top3);


      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };
    fetchResource();
  }, [])

  function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count > 0) {
        return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
      }
    }

    return "just now";
  }


  const categories = [
    { icon: '🍽️', name: 'Food Assistance', color: 'bg-orange-100 text-orange-600' },
    { icon: '🏠', name: 'Housing Support', color: 'bg-blue-100 text-blue-600' },
    { icon: '💼', name: 'Employment', color: 'bg-green-100 text-green-600' },
    { icon: '🏥', name: 'Healthcare', color: 'bg-red-100 text-red-600' },
    { icon: '📚', name: 'Educational Resources', color: 'bg-purple-100 text-purple-600' },
    { icon: '👶', name: 'Childcare', color: 'bg-pink-100 text-pink-600' }
  ];
  return (
    <ScrollView>
      <View className=''>
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
        <View className='bg-orange-500 flex p-4 gap-4'>
          <Text className='text-white font-semibold text-3xl'>Find Local Community Resources</Text>
          <Text className='text-white text-lg'>Connecting people with food banks, shelters, job training, healthcare, and more</Text>
          <TouchableOpacity onPress={() => {navigation.navigate("Request")}} className='w-56'>
            <Text  className='bg-white text-orange-600 rounded-xl p-2 font-semibold'>
              Request/Provide Resources
            </Text>
          </TouchableOpacity>
        </View>

        <View className='p-4'>
          <Text className='font-semibold'>Browse by Category</Text>

          <View className='flex gap-4 flex-row flex-wrap p-4 justify-evenly'>
            {categories.map((obj, index) => {
              return (
                <TouchableOpacity key={index} className={`bg-red-300 p-4 rounded-xl w-48 flex flex-col gap-4`}>
                  <Text className={`text-3xl`}>{obj.icon}</Text>
                  <Text className={`font-semibold`} >{obj.name}</Text>

                </TouchableOpacity>
              )
            })}
          </View>
        </View>
        <View className='p-4 flex flex-col gap-4'>
          <View className='flex flex-row justify-between'>
            <Text className='font-semibold text-lg'>Featured Resources</Text>

            <Text onPress={() => navigation.navigate('Resources')} className='text-blue-600'>View all {`>`}</Text>
          </View>
          {resource.map((obj, index) => {
            return (
              <View key={index} className='border rounded-xl backdrop-blur-lg p-4 gap-1 '>
                <View className='flex flex-row gap-4'>
                  <Text className='text-blue-900 p-1 px-3 rounded-xl bg-blue-200 font-semibold'>{obj.resourceType}</Text>
                  <Text className={`${obj.resourcePriority == 'Medium Priority' && 'bg-yellow-400 border-yellow-600'}
                                        ${obj.resourcePriority == 'Low Priority' && 'bg-green-400 border-green-600'}
                                        ${obj.resourcePriority == 'High Priority' && 'bg-red-400 border-red-600'}
                                         text-white border  p-2 rounded-xl`}>{obj.resourcePriority}</Text>
                </View>

                <Text className='font-semibold'>Resource {obj.resource}</Text>
                <Text>{obj.resourceDescription}</Text>
                <View className='flex flex-row justify-between'>
                  <Text>{timeAgo(obj.createdAt)}</Text>
                  <Text className='text-blue-500'>View Details</Text>
                </View>

              </View>
            )
          })}
        </View>


      </View>
    </ScrollView>

  );
}
