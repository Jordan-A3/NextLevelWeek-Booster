import React, {useState, useEffect, ChangeEvent, FormEvent} from 'react'
import { FiArrowLeft } from "react-icons/fi";
import {Link, useHistory} from 'react-router-dom'
import './styles.css'
import logo from '../../assets/logo.svg'

import axios from "axios";

import api from '../../services/api'

import {Map, TileLayer, Marker} from 'react-leaflet'
import {LeafletMouseEvent} from 'leaflet'

interface Item {
    id: number,
    name: string,
    image_url: string
}

interface IBGEufResponse{
    sigla:string
}

interface IBGECITYResponse{
    nome:string
}

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([])
    const [ufs, setUfs] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])

    const [selecteduf, setSelecteduf] = useState('0')
    const [selectedcity, setSelectedcity] = useState('0')

    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])

    const [selectItem, setSelectedItem] = useState<number[]>([])

    const [formData, setFormData] = useState({
        name:'',
        email:'',
        whatsapp:''
    })

    const history = useHistory()

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords

            setInitialPosition([latitude, longitude])
        })
    }, [])

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data)
        })
    }, [])

    useEffect(() => {
        axios.get<IBGEufResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla)

            setUfs(ufInitials)
        })
    }, [])

    useEffect(() => {
        if(selecteduf === '0'){
            return;
        }

        axios
            .get<IBGECITYResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selecteduf}/municipios`)
            .then(response => {
            const cities = response.data.map(city => (city.nome))

            setCities(cities)
        })

    }, [selecteduf])

    function handleSelectedUf(event:ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value

        setSelecteduf(uf)
    }

    function handleSelectedCity(event:ChangeEvent<HTMLSelectElement>){
        const city = event.target.value

        setSelectedcity(city)
    }

    function handleMapClick(event:LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target

        setFormData({ ...formData, [name]:value })
    }

    function handleSelectedItems(id : number) {
        const alredySelected = selectItem.findIndex(item => item === id)

        if(alredySelected >= 0){
            const filteredItems = selectItem.filter(item => item !== id)

            setSelectedItem(filteredItems)
        }else{
            setSelectedItem([...selectItem, id])
        }

        
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()

        const {name, email, whatsapp} = formData
        const uf = selecteduf
        const city = selectedcity
        const [latitude, longitude] = selectedPosition
        const items = selectItem

        const data = {
            name, email, whatsapp, uf, city, latitude, longitude, items 
        }
        await api.post('points', data) 

        alert('Ponto de coleta criado!')

        history.push('/')
    }

    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    Voltar para Home
                    <FiArrowLeft/>
                </Link>
            </header>

            <form onSubmit={handleSubmit} >
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name" >Nome da entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email" >E-mail</label>
                            <input 
                                type='email'
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp" >Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}> 
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                value={selecteduf} 
                                onChange={handleSelectedUf}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}> {uf} </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city"
                                value={selectedcity} 
                                onChange={handleSelectedCity}
                            >
                                <option value="0">Selecione uma Cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}> {city} </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                        <li 
                            key={item.id} 
                            onClick={() => handleSelectedItems(item.id)}
                            className={selectItem.includes(item.id) ? 'selected' : ''}
                        >
                            <img src={item.image_url} alt={item.name} />
                            <span>{item.name}</span>
                        </li>
                        ))}
                        
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta 
                </button>
            </form>
        </div>
    )
} 

export default CreatePoint