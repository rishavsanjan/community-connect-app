import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: 'green', backgroundColor: '#e6f9f0', marginTop:40 }}
      contentContainerStyle={{ paddingHorizontal: 5 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: 'green',
        textAlign:'center'
      }}
      text2Style={{
        fontSize: 20,
        color: 'black',
      }}
    />
  ),
  decline: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: 'red', backgroundColor: '#FFC2C4', marginTop:40 }}
      contentContainerStyle={{ paddingHorizontal: 5 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: 'red',
        textAlign:'center'
      }}
      text2Style={{
        fontSize: 20,
        color: 'black',
      }}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: 'red', backgroundColor: '#ffe6e6' }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: 'red',
      }}
      text2Style={{
        fontSize: 14,
        color: 'black',
      }}
    />
  ),
};

export default toastConfig;
