import React, { Component, useState, ChangeEvent, useEffect } from 'react'
import { Text, View, ImageBackground, Image, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Picker, Alert } from 'react-native'
import { RectButton } from "react-native-gesture-handler";
import { Feather as Icon } from "@expo/vector-icons";
import {useNavigation} from '@react-navigation/native'
import axios from 'axios'

interface IBGEufResponse{
  sigla:string
}

interface IBGECITYResponse{
  nome:string
}

const Home = () => {
  const [selecteduf, setSelecteduf] = useState('Escolha a Uf')
  const [selectedcity, setSelectedcity] = useState('0')

  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])

  const navigation = useNavigation()
  const logo = "../../assets/logo.png"
  const imageBackground = "../../assets/home-background.png"
  
  function handleNavigateToPoints(){
    navigation.navigate('Points', {selecteduf, selectedcity})
  }

  useEffect(() => {
    axios.get<IBGEufResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
        const ufInitials = response.data.map(uf => uf.sigla)

        setUfs(ufInitials)
    })
}, [])

  useEffect(() => {
    if(selecteduf === 'Escolha a Uf'){
        return;
    }else{
      axios
          .get<IBGECITYResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selecteduf}/municipios`)
          .then(response => {
          const cities = response.data.map(city => (city.nome))

          setCities(cities)
      })
    }
  }, [selecteduf])


  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ImageBackground 
        source={require(imageBackground)} 
        style={styles.container}
        imageStyle={{width:274, height:368}}
      >
        <View style={styles.main}>
          <Image source={require(logo)}/>
          <View>
            <Text style={styles.title}>Seu Marketplace de coleta de resíduos </Text>
            <Text style={styles.description} >Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente. </Text>
          </View>
        </View>  

        <View style={styles.footer}>
          <Picker selectedValue={selecteduf} onValueChange={(itemValue, itemIndex) => setSelecteduf(itemValue)}>
            <Picker.Item label="Escolha a Uf" value="Escolha a Uf"/>
            {ufs.map(uf => (
              <Picker.Item key={uf} label={uf} value={uf} />
            ))}
          </Picker>

          <Picker selectedValue={selectedcity} onValueChange={(itemValue, itemIndex) => setSelectedcity(itemValue)}>
            <Picker.Item label="Escolha a Cidade" value="Escolha a Cidade"/>
            {cities.map(city => (
              <Picker.Item key={city} label={city} value={city} />
            ))}
          </Picker>

          <RectButton style={styles.button} onPress={handleNavigateToPoints}>
            <View style={styles.buttonIcon} >
              <Text>
                <Icon name="arrow-right" color="#FFF" size={24} />
              </Text>
            </View>
            <Text style={styles.buttonText} >  
              Entrar 
            </Text>
          </RectButton>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
    },
  
    main: {
      flex: 1,
      justifyContent: 'center',
    },
  
    title: {
      color: '#322153',
      fontSize: 32,
      fontFamily: 'Ubuntu_700Bold',
      maxWidth: 260,
      marginTop: 64,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 16,
      fontFamily: 'Roboto_400Regular',
      maxWidth: 260,
      lineHeight: 24,
    },
  
    footer: {},
  
    select: {},
  
    input: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  
    button: {
      backgroundColor: '#34CB79',
      height: 60,
      flexDirection: 'row',
      borderRadius: 10,
      overflow: 'hidden',
      alignItems: 'center',
      marginTop: 8,
    },
  
    buttonIcon: {
      height: 60,
      width: 60,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      color: '#FFF',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    }
  });

export default Home