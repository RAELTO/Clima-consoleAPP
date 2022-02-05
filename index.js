require('dotenv').config();

const { leerInput, inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async() => {
    
    const busquedas = new Busquedas;
    let opt;

    do {
        //Imprimir el menú
        opt = await inquirerMenu();
        
        switch (opt) {
            case 1:
                //Mostrar mensaje
                const termino = await leerInput('Ciudad: ');
                
                //Buscar lugares
                const lugares = await busquedas.ciudad( termino );

                //Seleccionar el lugar
                const idSeleccionado = await listarLugares(lugares);
                if (idSeleccionado === '0') continue;

                const lugarSel = lugares.find(l => l.id === idSeleccionado);

                //Guardar en DB
                busquedas.addHistory(lugarSel.nombre);

                //Clima

                const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);
                //console.log('DATA: ' + clima.temp);

                //Mostrar resultados
                console.clear();
                console.log('\nInfo de la ciudad\n');
                console.log('Ciudad:', lugarSel.nombre);
                console.log('Lat:', lugarSel.lat);
                console.log('Lng:', lugarSel.lng);
                console.log(`Temperatura: ${clima.temp}°C`);
                console.log(`Sensación térmica: ${clima.feelsLike}°C`);
                console.log('Mínima:', clima.tempMin);
                console.log('Máxima:', clima.tempMax);
                console.log('Cómo está el clima:', clima.desc);

            break;

            case 2:
                busquedas.historyUpperCase.forEach((lugar, i) => {
                    const idx = `${i + 1}`;
                    console.log(`${idx}. ${lugar}`);
                });
                //console.log(busquedas.history[0].toUpperCase());

            break;

        }

        if (opt !== 0) await pausa();

    } while (opt !== 0);

}

main();