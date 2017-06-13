var request = require("request");
var express = require('express');
var app = express();
var list = new Array(17);
var sidoList = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주', '세종'];

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.json({msg: 'OK' });
});

app.get('/getDust/:update', function (req, res) {
  console.log('app.get: update');
  get_full_request();
  res.json({msg: 'UPDATE OK' });
});

app.get('/getDust/sido/:sidoname', function (req, res) {
  console.log('app.get: '+req.params.sidoname);
  var indexOfsidoName = sidoList.indexOf(req.params.sidoname);
  if(!list[0]) {
    console.log('list is null. need to update');
    get_full_request();
    res.json([{msg: 'RETRY REQUEST'}])
  } else {
    res.json(list[indexOfsidoName]);
  }
});

app.get('/getDust/sido/:sidoname/:cityname', function (req, res) {
  console.log('app.get: '+req.params.sidoname+' - '+req.params.cityname);
  var indexOfsidoName = sidoList.indexOf(req.params.sidoname);
  var _list = new Array();
  if(!list[0]) {
    console.log('list is null. need to update');
    get_full_request();
    res.json([{msg: 'RETRY REQUEST'}])
  } else {
    for(var i in list[indexOfsidoName]) {
        if(list[indexOfsidoName][i].cityName == req.params.cityname) {
          _list.push(list[indexOfsidoName][i]);
        }
    }
    res.json(_list);
  }
});

app.get('/getDust/sido/:sidoname/:cityname/:index', function (req, res) {
  console.log('app.get: '+req.params.sidoname+' - '+req.params.cityname+' - '+req.params.index);
  var indexOfsidoName = sidoList.indexOf(req.params.sidoname);
  var _list = new Array();
  var __list = new Array();
  if(req.params.index>24) {
    req.params.index = 24;
  }

  if(!list[0]) {
    console.log('list is null. need to update');
    get_full_request();
    res.json([{msg: 'RETRY REQUEST'}])
  } else {
    for(var i in list[indexOfsidoName]) {
        if(list[indexOfsidoName][i].cityName == req.params.cityname) {
          _list.push(list[indexOfsidoName][i]);
        }
    }
    for(var i=0; i < req.params.index; i++) {
      //console.log(i+ " Json "+ _list[i]);
      __list.push(_list[i]);
    }
    res.json(__list);
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function fetch_callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log(body);
      var info = JSON.parse(body);
      //console.log('Retuen : '  + info);
      var indexOfsidoName = sidoList.indexOf(info.list[0].sidoName);
      //console.log(info.list[0].sidoName +" - "+indexOfsidoName);
      list[indexOfsidoName] = info.list;
      //console.log('Save List : '+ list[0][0].sidoName);
    }
}

var get_url = function (i) {
  var url = 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureSidoLIst?sidoName=';
  var url_option = '&searchCondition=DAILY&pageNo=1&numOfRows=1000&ServiceKey=fSjF%2BbianLiW4jHvdfbA01kU%2F3KswrUWX87iXUYtqDdkDWqv2W8FSEmVZTob203aERdrQ%2BxOZD7mmc1Q%2FTGwgQ%3D%3D&_returnType=json';
  return url+encodeURI(sidoList[i])+url_option;
}

function full_dust_request () {
  for(var i in sidoList) {
    //console.log('get_full_request:' + i);
    request(get_url(i), fetch_callback);
  }
}

function startDustObserving() {
    var isTriggered = false;

    function triggerGetRequest() {
        full_dust_request();
    }

    function callEveryHour() {
        if (isTriggered == false) {
            triggerGetRequest();
            isTriggered = true;     
        }
        setInterval(triggerGetRequest, 1000 * 60 * 60);
    }

    full_dust_request();

    var nextDate = new Date();
    var d = nextDate;

    if (nextDate.getMinutes() === 30) {
        callEveryHour();
    } else if (nextDate.getMinutes() < 30) {
        nextDate.setHours(d.getHours());
        nextDate.setMinutes(30);
        nextDate.setSeconds(0);
        var difference = nextDate - new Date();
        setTimeout(callEveryHour, difference);
    }
    else {
        nextDate.setHours(d.getHours() + 1);
        nextDate.setMinutes(30);
        nextDate.setSeconds(0);
        var difference = nextDate - new Date();
        setTimeout(callEveryHour, difference);
    }
}

startDustObserving();
