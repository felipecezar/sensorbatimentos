var texto = document.querySelector('#status');
var medicoes = [];

texto.addEventListener('click', () => {
  texto.textContent = 'Repire...';
  medicoes = [];
  sensorFrequenciaCardiaca.conectar()
  .then(() => sensorFrequenciaCardiaca.iniciarNotificacoesMedicaoFrequenciaCardicaca()
    .then(handleHeartRateMeasurement)
  )
  .catch(erro => {
    texto.textContent = erro;
  });
});

function handleHeartRateMeasurement(sensorFrequenciaCardiaca) {
  sensorFrequenciaCardiaca.addEventListener('characteristicvaluechanged', event => {
    var medicao = sensorFrequenciaCardiaca.parseHeartRate(event.target.value);
    texto.innerHTML = medicao.heartRate + ' &#x2764;';
    medicoes.push(medicao.heartRate);
  });
}
