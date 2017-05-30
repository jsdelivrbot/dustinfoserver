var get_request = require("request");

var express = require('express');
var app = express();

var list;

app.get('/getDust/:cityname', function (req, res) {
  console.log('app.get: '+req.params.cityname);

  var _list = new Array();
  for(var i in list) {
      if(list[i].cityName == req.params.cityname) {
        _list.push(list[i]);
      }
  }
  res.json(_list);
});

app.get('/', function(req, res) {
  res.send('Hello Dust Server!');
});

app.listen(5000, function () {
  console.log('Example app listening on port 3000!');
});

var fetch_options = {
    url: 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureSidoLIst?sidoName=%EC%84%9C%EC%9A%B8&searchCondition=DAILY&pageNo=1&numOfRows=1000&ServiceKey=fSjF%2BbianLiW4jHvdfbA01kU%2F3KswrUWX87iXUYtqDdkDWqv2W8FSEmVZTob203aERdrQ%2BxOZD7mmc1Q%2FTGwgQ%3D%3D&_returnType=json',
}

function fetch_callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log(body);
      var info = JSON.parse(body);
      list = info.list;

      //var cityName = list[0].cityName;  
      //var dataTime = list[0].dataTime;
      //var pm10Value = list[0].pm10Value;
      //var pm25Value = list[0].pm25Value;
      console.log('Save List : ' + new Date());
    }
}

function startDustObserving() {
    var isTriggered = false;

    function triggerGetRequest() {
        get_request(fetch_options, fetch_callback);
    }

    function callEveryHour() {
        if (isTriggered == false) {
            triggerGetRequest();
            isTriggered = true;     
        }
        setInterval(triggerGetRequest, 1000 * 60 * 60);
    }

    get_request(fetch_options, fetch_callback);

    var nextDate = new Date();
    var d = nextDate;

    if (nextDate.getMinutes() === 0) {
        callEveryHour();
    } else if (nextDate.getMinutes() < 10) {
        nextDate.setHours(d.getHours());
        nextDate.setMinutes(10);
        nextDate.setSeconds(0);
        var difference = nextDate - new Date();
        setTimeout(callEveryHour, difference);
    }
    else {
        nextDate.setHours(d.getHours() + 1);
        nextDate.setMinutes(10);
        nextDate.setSeconds(0);
        var difference = nextDate - new Date();
        setTimeout(callEveryHour, difference);
    }
}

startDustObserving();
