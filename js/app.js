var statusText = document.querySelector('#statusText');
var heartRates = [];
var mode = 'bar';

statusText.addEventListener('click', function() {
  statusText.textContent = 'Breathe...';
  heartRates = [];
  heartRateSensor.connect()
  .then(() => heartRateSensor.startNotificationsHeartRateMeasurement()
    .then(handleHeartRateMeasurement)
  )
  .catch(erro => {
    statusText.textContent = erro;
  });
});

function handleHeartRateMeasurement(heartRateMeasurement) {
  heartRateMeasurement.addEventListener('characteristicvaluechanged', event => {
    var heartRateMeasurement = heartRateSensor.parseHeartRate(event.target.value);
    statusText.innerHTML = heartRateMeasurement.heartRate + ' &#x2764;';
    heartRates.push(heartRateMeasurement.heartRate);
  });
}
