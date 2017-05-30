var badDustContition = 80;
var get_request = require("request");

var fetch_options = {
    url: 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureSidoLIst?sidoName=%EC%84%9C%EC%9A%B8&searchCondition=DAILY&pageNo=1&numOfRows=10&ServiceKey=fSjF%2BbianLiW4jHvdfbA01kU%2F3KswrUWX87iXUYtqDdkDWqv2W8FSEmVZTob203aERdrQ%2BxOZD7mmc1Q%2FTGwgQ%3D%3D&_returnType=json',
}

function fetch_callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log(body);
      var info = JSON.parse(body);
      var list = info.list;
      var cityName = list[0].cityName;  
      var dataTime = list[0].dataTime;
      var pm10Value = list[0].pm10Value;
      var pm25Value = list[0].pm25Value;
      console.log(cityName+' '+dataTime+' PM10: '+pm10Value+' PM2.5: '+pm25Value);
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
    } else if (nextDate.getMinutes() < 20) {
        nextDate.setHours(d.getHours());
        nextDate.setMinutes(5);
        nextDate.setSeconds(0);
        var difference = nextDate - new Date();
        setTimeout(callEveryHour, difference);
    }
    else {
        nextDate.setHours(d.getHours() + 1);
        nextDate.setMinutes(5);
        nextDate.setSeconds(0);
        var difference = nextDate - new Date();
        setTimeout(callEveryHour, difference);
    }
}

startDustObserving();
