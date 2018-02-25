var request = require("request");
var express = require('express');
var app = express();
var list = new Array(17);
var sidoList = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주', '세종'];
var updatedTime;

app.set('port', (process.env.PORT || 5000));

app.get('/', function(req, res) {
  res.json({msg: 'OK' });
});

app.get('/getDust/:sidoname', function (req, res) {
  console.log('app.get: '+req.params.sidoname);
  var indexOfsidoName = sidoList.indexOf(req.params.sidoname);

  //데이터가 없거나 시간 차가 1시간 35분 이상일때
  if(!list[indexOfsidoName] || getDiffTime(list[indexOfsidoName][0].dataTime) >= 5700000) {
    console.log('Need To Update Data');
    request(get_url(sidoList.indexOf(req.params.sidoname)), function (error, response, body) {
      var info;
      if (!error && response.statusCode === 200) {
        try {
          var info = JSON.parse(body);
          var indexOfsidoName = sidoList.indexOf(info.list[0].sidoName);
          list[indexOfsidoName] = info.list;
          console.log('Save List : '+ info.list[0].sidoName);
        } catch (e) {
          console.log("JSON.parse exception:");
        }
      }
      res.set('Cache-Control', 'public, max-age=1, s-maxage='+getCacheTime(list[indexOfsidoName][0].dataTime));
      res.json(list[indexOfsidoName]);
    });
  } else {
    //시간 차가 1시간 35분 미만일때 서버 데이터 리턴
    res.set('Cache-Control', 'public, max-age=1, s-maxage='+getCacheTime(list[indexOfsidoName][0].dataTime));
    res.json(list[indexOfsidoName]);
  }
});

app.get('/getDust/:sidoname/:cityname', function (req, res) {
  console.log('app.get: '+req.params.sidoname+' - '+req.params.cityname);
  var indexOfsidoName = sidoList.indexOf(req.params.sidoname);
  var _list = new Array();
  
  //데이터가 없거나 시간 차가 1시간 35분 이상일때
  if(!list[indexOfsidoName] || getDiffTime(list[indexOfsidoName][0].dataTime) >= 5700000) {
    console.log('Need To Update Data');
    request(get_url(sidoList.indexOf(req.params.sidoname)), function (error, response, body) {
      var info;
      if (!error && response.statusCode === 200) {
        try {
          var info = JSON.parse(body);
          var indexOfsidoName = sidoList.indexOf(info.list[0].sidoName);
          list[indexOfsidoName] = info.list;
          console.log('Save List : '+ info.list[0].sidoName);
        } catch (e) {
          console.log("JSON.parse exception:");
        }
      }

      for(var i in list[indexOfsidoName]) {
          if(list[indexOfsidoName][i].cityName == req.params.cityname) {
            _list.push(list[indexOfsidoName][i]);
          }
      }
      res.set('Cache-Control', 'public, max-age=1, s-maxage='+getCacheTime(list[indexOfsidoName][0].dataTime));
      res.json(_list);
    });
  } else {
    //시간 차가 1시간 35분 미만일때 서버 데이터 리턴
    for(var i in list[indexOfsidoName]) {
      if(list[indexOfsidoName][i].cityName == req.params.cityname) {
        _list.push(list[indexOfsidoName][i]);
      }
    }
    res.set('Cache-Control', 'public, max-age=1, s-maxage='+getCacheTime(list[indexOfsidoName][0].dataTime));
    res.json(_list);
  }
});

app.get('/getDust/:sidoname/:cityname/:index', function (req, res) {
  console.log('app.get: '+req.params.sidoname+' - '+req.params.cityname+' - '+req.params.index);
  var indexOfsidoName = sidoList.indexOf(req.params.sidoname);
  var _list = new Array();
  var __list = new Array();

  if(req.params.index > 24) {
    req.params.index = 24;
  }

  //데이터가 없거나 시간 차가 1시간 35분 이상일때
  if(!list[indexOfsidoName] || getDiffTime(list[indexOfsidoName][0].dataTime) >= 5700000) {
    console.log('Need To Update Data');
    request(get_url(sidoList.indexOf(req.params.sidoname)), function (error, response, body) {
      var info;
      if (!error && response.statusCode === 200) {
        try {
          var info = JSON.parse(body);
          var indexOfsidoName = sidoList.indexOf(info.list[0].sidoName);
          list[indexOfsidoName] = info.list;
          console.log('Save List : '+ info.list[0].sidoName);
        } catch (e) {
          console.log("JSON.parse exception:");
        }
      }

      for(var i in list[indexOfsidoName]) {
          if(list[indexOfsidoName][i].cityName == req.params.cityname) {
            _list.push(list[indexOfsidoName][i]);
          }
      }

      for(var i=0; i < req.params.index; i++) {
        //console.log(i+ " Json "+ _list[i]);
        __list.push(_list[i]);
      }
      
      res.set('Cache-Control', 'public, max-age=1, s-maxage='+getCacheTime(list[indexOfsidoName][0].dataTime));
      res.json(__list);
    });
  } else {
    //시간 차가 1시간 35분 미만일때 서버 데이터 리턴
    for(var i in list[indexOfsidoName]) {
      if(list[indexOfsidoName][i].cityName == req.params.cityname) {
        _list.push(list[indexOfsidoName][i]);
      }
    }

    for(var i=0; i < req.params.index; i++) {
      //console.log(i+ " Json "+ _list[i]);
      __list.push(_list[i]);
    }

    res.set('Cache-Control', 'public, max-age=1, s-maxage='+getCacheTime(list[indexOfsidoName][0].dataTime));
    res.json(__list);
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var get_url = function (i) {
  var url = 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureSidoLIst?sidoName=';
  var url_option = '&searchCondition=DAILY&pageNo=1&numOfRows=1000&ServiceKey=fSjF%2BbianLiW4jHvdfbA01kU%2F3KswrUWX87iXUYtqDdkDWqv2W8FSEmVZTob203aERdrQ%2BxOZD7mmc1Q%2FTGwgQ%3D%3D&_returnType=json';
  return url+encodeURI(sidoList[i])+url_option;
}

var getDiffTime = function (dataime) {
  var savedtime = new Date(dataime);
  savedtime.setHours(savedtime.getHours() - 9); //utc 시간으로 보정
  var difference =  new Date() - savedtime;
  console.log('difference(m) : ' + Math.floor(difference/60000));
  return difference;
}

var getCacheTime = function (datetime) {
  var nextUpdateTime = new Date(datetime);
  nextUpdateTime.setHours(nextUpdateTime.getHours() - 9); //utc 시간으로 보정
  nextUpdateTime.setHours(nextUpdateTime.getHours() + 1); //다음업데이트 시간
  nextUpdateTime.setMinutes(nextUpdateTime.getMinutes() + 36); //다음 업데이트 시간
  var cacheTime =  Math.floor((nextUpdateTime - new Date())/1000); //다음 업데이트 남은 분
  console.log('Cache Time : ' + cacheTime + '(s), Cache Time(m) : ' + Math.floor(cacheTime/60) + "(m)");
  return cacheTime;
}