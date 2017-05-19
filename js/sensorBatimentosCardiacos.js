
(function() {
  'use strict';

  class SensorFrequenciaCardiaca{
    constructor() {
      this.dispositivo = null;
      this.servidor = null;
      this._caracteristicas = new Map();
    }
    conectar() {
      return navigator.bluetooth.requestDevice({filters:[{services:[ 'heart_rate' ]}]})
      .then(dispositivo => {
        this.dispositivo = dispositivo;
        return dispositivo.gatt.connect();
      })
      .then(servidor => {
        this.servidor = servidor;
        return Promise.all([
          servidor.getPrimaryService('heart_rate').then(servico => {
            return Promise.all([
              this._guardarCaracteristica(servico, 'body_sensor_location'),
              this._guardarCaracteristica(servico, 'heart_rate_measurement'),
            ])
          })
        ]);
      })
    }

    /* Serviço de Frenquecia Cardiaca */

    iniciarNotificacoesMedicaoFrequenciaCardicaca() {
      return this._iniciarNotificacoes('heart_rate_measurement');
    }

    pararNotificacoesMedicaoFrequenciaCardicaca() {
      return this._pararNotificacoes('heart_rate_measurement');
    }

    parseHeartRate(value) {

      value = value.buffer ? value : new DataView(value);

      let flags = value.getUint8(0);
      let rate16Bits = flags & 0x1;
      let result = {};
      let index = 1;

      if (rate16Bits) {
        result.heartRate = value.getUint16(index, /*littleEndian=*/true);
        index += 2;
      } else {
        result.heartRate = value.getUint8(index);
        index += 1;
      }

      let contactDetected = flags & 0x2;
      let contactSensorPresent = flags & 0x4;

      if (contactSensorPresent) {
        result.contactDetected = !!contactDetected;
      }

      let energyPresent = flags & 0x8;

      if (energyPresent) {
        result.energyExpended = value.getUint16(index, /*littleEndian=*/true);
        index += 2;
      }

      let rrIntervalPresent = flags & 0x10;

      if (rrIntervalPresent) {
        let rrIntervals = [];
        for (; index + 1 < value.byteLength; index += 2) {
          rrIntervals.push(value.getUint16(index, /*littleEndian=*/true));
        }
        result.rrIntervals = rrIntervals;
      }

      return result;
    }

    /* Utilitários */

    _guardarCaracteristica(servico, caracteristicaUUID) {
      return servico.getCharacteristic(caracteristicaUUID)
      .then(caracteristica => {
        this._caracteristicas.set(caracteristicaUUID, caracteristica);
      });
    }

    _lerValorCaracteristica(caracteristicaUUID) {
      let caracteristica = this._caracteristicas.get(caracteristicaUUID);
      return caracteristica.readValue()
      .then(valor => {
        valor = valor.buffer ? valor : new DataView(valor);
        return valor;
      });
    }

    _escreverValorCaracteristica(caracteristicaUUID, valor) {
      let caracteristica = this._caracteristicas.get(caracteristicaUUID);
      return caracteristica.writeValue(valor);
    }

    _iniciarNotificacoes(caracteristicaUUID) {
      let caracteristica = this._caracteristicas.get(caracteristicaUUID);
      return caracteristica.startNotifications()
      .then(() => caracteristica);
    }

    _pararNotificacoes(caracteristicaUUID) {
      let caracteristica = this._caracteristicas.get(caracteristicaUUID);
      return caracteristica.stopNotifications()
      .then(() => caracteristica);
    }
  }

  window.sensorFrequenciaCardiaca = new SensorFrequenciaCardiaca();

})();
