var milisecnondsinyear = 1000 * 60 * 60 * 24 * 365;
var milisecnondsinday = 1000 * 60 * 60 * 24;
var milisecnondsinhour = 1000 * 60 * 60;
var milisecnondsinminute = 1000 * 60;
var milisecnondsinsecond = 1000;
var lastSicho;

new Request.JSON({
  url: '/lastsicho',
  onSuccess: function(response){
    lastSicho = new Date(response.date);
    document.getElementById('lastSichoDate').innerHTML = lastSicho.toUTCString();
    var interval = setInterval(function() {
      document.getElementById('timer_div').innerHTML = getTime();
    }, 1000);
  }
}).send();


function getTime() {
  var result;
  var time_in_mili = new Date() - lastSicho;
  var yearsResult = convertFromMili(time_in_mili, milisecnondsinyear);
  time_in_mili = yearsResult.reminder;
  var daysResult = convertFromMili(time_in_mili, milisecnondsinday);
  time_in_mili = daysResult.reminder;
  var hoursResult = convertFromMili(time_in_mili, milisecnondsinhour);
  time_in_mili = hoursResult.reminder;
  var minutesResult = convertFromMili(time_in_mili, milisecnondsinminute);
  time_in_mili = minutesResult.reminder;
  var secondsResult = convertFromMili(time_in_mili, milisecnondsinsecond);
  time_in_mili = secondsResult.reminder;
  return yearsResult.result + ":" + daysResult.result +
    ":" + hoursResult.result + ":" + minutesResult.result + ":" + secondsResult.result;
}

function convertFromMili(mili, convertRate) {
  var count = Math.floor(mili / convertRate);
  return {
    result: count,
    reminder: mili - count * convertRate
  };
}

function updateReasons() {
    new Request.JSON({
        url: '/excuses',
        method: 'GET',
        onSuccess: function(response) {
            populateReasons(response);
        }
    }).send();
}
function postExcuse(excuse){
  new Request.JSON({
    url: '/excuses',
    data: {newExcuse: excuse},
    method: 'POST',
    onSuccess: function(){
        updateReasons();
    }
  }).send();
}

var populateReasons = function(obj) {
  obj.forEach(function(excuse){
    console.log(excuse);
    var newExcuse = "<input type=\"radio\" name=\"reasons\" class=\"radioButton\" value=\""+ excuse + "\">" + excuse + "<br>";
    console.log(newExcuse);
    document.id('reasons').appendHTML(newExcuse);
  });
};

updateReasons();

document.id('reportButton').addEvents(
  {
    click: function(){
      var radio = document.querySelector('input[name="reasons"]:checked');
      if (radio.id === 'specialRadio') {
        postExcuse($('newExcuse').value);
      } else {
        postExcuse(radio.value);
      }
    }
  }
);
