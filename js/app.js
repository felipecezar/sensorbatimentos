let medidorCaracteristica = null;
let dispositivoBluetooth = null;
let conectado = false;

const SERVICO = 'heart_rate';
const CARACTERISTICA   = 'heart_rate_measurement';

let btConectar = document.querySelector('#bt-conectar');
let btDesconectar = document.querySelector('#bt-desconectar');
let txBatimentos = document.querySelector('#batimentos');

btConectar.addEventListener("click", conectar);
btDesconectar.addEventListener("click", desconectar);

function conectar(){

    if(!conectado){
        // console.log('Solicitando conecão com dispositivo bluetooth...')
        // return navigator.bluetooth.requestDevice({filters:[{services:[SERVICO]}]})
        // .then(dispositivo => {
        //     dispositivoBluetooth = dispositivo;
        //     console.log('   > Dispositivo encontrado ' + dispositivo.name);
        //     console.log('Conectando ao servidor GATT...');
        //     return dispositivo.gatt.connect();
        // })
        // .then(servidor => {
        //     console.log('Obtendo o serviço...');
        //     return servidor.getPrimaryService(SERVICO);
        // })
        // .then(servico => {
        //     console.log('Obtendo a caracteristica...');
        //     return servico.getCharacteristic(CARACTERISTICA);
        // })
        // .then(caracteristica => {
        //     console.log('   > Caracteristica encontrada!')
        //     medidorCaracteristica = caracteristica;
        //     console.log('   > Dispositivo conectado');
        //     btConectar.classList.add('esconder');
        //     btDesconectar.classList.remove('esconder');
        //     conectado = true;
        //     return caracteristica.startNotifications();
        // })
        // .then(caracteristica =>{
        //     caracteristica.addEventListener('characteristicvaluechanged',tratarMedicao);
        //     console.log('Notificação iniciada!!!.');
        // })
        // .catch(erro => {
        //     console.error('Fudeu! ' + erro);
        // })

        navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })
        .then(device => device.gatt.connect())
        .then(server => server.getPrimaryService('heart_rate'))
        .then(service => service.getCharacteristic('heart_rate_measurement'))
        .then(characteristic => characteristic.startNotifications())
        .then(characteristic => {
          characteristic.addEventListener('characteristicvaluechanged',tratarMedicao);
          console.log('Notifications have been started.');
        })
        .catch(error => { console.log(error); });
    }
}

function desconectar(){
    if (!dispositivoBluetooth) {
       return;
     }
     if (dispositivoBluetooth.gatt.connected) {
        conectado = false;
        dispositivoBluetooth.gatt.disconnect();
        btDesconectar.classList.add('esconder')
        btConectar.classList.remove('esconder')
        console.log('Dispositivo desconectado');
     }
}

function parseFrequenciaCardiaca(valor) {

      valor = valor.buffer ? valor : new DataView(valor);
      let flags = valor.getUint8(0);
      let rate16Bits = flags & 0x1;
      let resultado = {};
      let indice = 1;
      if (rate16Bits) {
        resultado.frequencia = valor.getUint16(indice, /*littleEndian=*/true);
        index += 2;
      } else {
        resultado.frequencia = valor.getUint8(indice);
        indice += 1;
      }
      let contactDetected = flags & 0x2;
      let contactSensorPresent = flags & 0x4;
      if (contactSensorPresent) {
        resultado.contactDetected = !!contactDetected;
      }
      let energyPresent = flags & 0x8;
      if (energyPresent) {
        resultado.energyExpended = value.getUint16(indice, /*littleEndian=*/true);
        index += 2;
      }
      let rrIntervalPresent = flags & 0x10;
      if (rrIntervalPresent) {
        let rrIntervals = [];
        for (; index + 1 < valor.byteLength; indice += 2) {
          rrIntervals.push(valalor.getUint16(indice, /*littleEndian=*/true));
        }
        resultado.rrIntervals = rrIntervals;
      }
      return resultado;
    }


function tratarMedicao(evento){
    console.log("Teste");
    var medicao = parseFrequenciaCardiaca(evento.target.value);
    console.log(medicao.frequencia);
    txBatimentos.innerHTML = medicao.frequencia + ' &#x2764;';
}
