const fs = require('fs');
const axios = require('axios');

class Busquedas {	

    history = [];
    dbPath = './db/database.json';

    //leer DB
    constructor() {
        this.readDB();
    }

    get historyUpperCase() {

        //Capitalizar cada palabra
        return this.history.map(place =>{

            let words = place.split(' ');
            words = words.map(word => word[0].toUpperCase() + word.substring(1));

            return words.join(' ');

        })
        
    }

    get paramsMapbox() {
        return {
            'limit': 5,
            'language': 'es',
            'access_token': process.env.MAPBOX_KEY
        }
    }

    get paramsWeatherMap() {
        return {
            'units': 'metric',
            'lang': 'es'
        }
    }

    async ciudad(lugar = '') {

        try {
            //peticion http

            const instance = axios.create({
                baseURL: 'https://api.mapbox.com/geocoding/v5/mapbox.places/',
                params: this.paramsMapbox
            });

            const resp = await instance.get(`${lugar}.json`);
            return resp.data.features.map( lugar =>({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));

        } catch (error) {
            return [];
        }

    }

    async climaLugar(lat, lon){

        try {

            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5`,
                params: this.paramsWeatherMap
            });

            //resp.data extraer la info de la data
            const resp = await instance.get(`weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_KEY}`);
            const {weather, main} = resp.data;//desestructuro weather y main de la data
            return {
                desc: `${weather[0].description.charAt(0).toUpperCase()}${weather[0].description.slice(1)}`,
                tempMin: main.temp_min,
                tempMax: main.temp_max,
                temp: main.temp,
                feelsLike: main.feels_like
            };

        } catch (error) {
            console.log(error);
        }

    }

    addHistory(lugar = ''){

        //Prevenir duplicados

        if (this.history.includes(lugar.toLocaleLowerCase())) {
            return;
        }

        this.history = this.history.splice(0, 5);//mantiene las 6 últimas busquedas en el historial

        this.history.unshift(lugar.toLocaleLowerCase());

        //Save in DB
        this.saveInDB();
    }

    saveInDB(){

        const payload = {
            history: this.history
        };

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));

    }

    readDB(){
        //si existe -> const info ... readFileSync... path {enconding: 'utf-8'}
        //const data = JSON.algo(info);

        if ( !fs.existsSync( this.dbPath )) return; 
    
        const info = fs.readFileSync(this.dbPath, {enconding: 'utf-8'});
        const data = JSON.parse(info);
        this.history = data.history;

    }

}

module.exports = Busquedas;