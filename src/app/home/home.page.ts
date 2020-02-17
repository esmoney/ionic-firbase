import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
// var json = require('../../assets/sample2.geo.json');
import json from "../../assets/sample2.geo.json";

import {
  KakaoMapsProvider,
  LatLng,
  Marker,
  MapConfig,
  MarkerOptions,
  Polygon,
  CustomOverlay,
  KakaoMap,
  KakaoEvents,
  InfoWindow,
  PolygonOptions
} from 'kakao-maps-sdk';
import { firestore } from 'firebase';

declare var kakao: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  providers: [KakaoMapsProvider]
})
export class HomePage implements OnInit {
  KaKaoJavascriptAPIKey = '9f73ccd3ff6aea1c551e765226754c34'; // kakao map 인증키
  mapConfig: MapConfig = { width: '100%', height: '100%' }; // 맵 설정
  latitude: number = 37.51042524745239; // 위도
  longitude: number = 127.04147573024453; // 경도
  isMarkerMaking: boolean = false; // 플래그
  mapInfo: any = {};
  coffeeOrders = []
  isShowToolBox: boolean = false;

  map: KakaoMap;
  width = { width: 350 + 'px', height: 100 + '%' };
  isMarkerDel: boolean = false;
  selMarker: Marker;

  polygons = [];
  /**
   * 홈을 초기화하는 생성자이다.
   * @param _kakaoMapsProvider 카카오맵제공자
   */
  constructor(public _kakaoMapsProvider: KakaoMapsProvider,
    public db: AngularFireDatabase,
    public firebaseService: AngularFirestore
  ) {
    // if (navigator.geolocation) {
    //   // GeoLocation을 이용해서 접속 위치를 얻어온다.
    //   navigator.geolocation.getCurrentPosition(function (position) {
    //     self.latitude = position.coords.latitude;
    //     self.longitude = position.coords.longitude;
    //   });
    // }

    this.mapInfo['markers'] = [];
    this.initMap();
  }

  /**
   * 초기화 함수다.
   */
  ngOnInit(): void {

  }

  xx(): void {
    let datas = json.features;
    let coordinates = [];
    var name = ""
    

    datas.forEach(data => {
      coordinates = data.geometry.coordinates;
      name = data.properties.SIG_KOR_NM;

      this.displayArea(coordinates, name);
    });
  }

  displayArea(coordinates, name) {
    let path = [];
    let points = [];

    coordinates[0].forEach(coordinate => {
      let point: any = {};
      point.x = coordinate[1];
      point.y = coordinate[0];
      points.push(point);
      path.push(new LatLng(coordinate[1], coordinate[0]));
    });

    let self = this;
    let polygon = new Polygon({
      map: self.map,
      path: path,
      strokeWeight: 2,
      strokeColor: '#004c80',
      strokeOpacity: 0.8,
      fillColor: '#fff',
      fillOpacity: 0.7
    });

    this.polygons.push(polygon);


    let customOverlay = new CustomOverlay({});
    let infowindow = new InfoWindow({removable: true});

    // 다각형에 mouseover 이벤트를 등록하고 이벤트가 발생하면 폴리곤의 채움색을 변경합니다 
    // 지역명을 표시하는 커스텀오버레이를 지도위에 표시합니다
    kakao.maps.event.addListener(polygon, 'mouseover', function (mouseEvent) {
      polygon.setOptions({ fillColor: '#09f' });

      customOverlay.setContent('<div class="area">' + name + '</div>');

      customOverlay.setPosition(mouseEvent.latLng);
      customOverlay.setMap(self.map);
    });

    // 다각형에 mousemove 이벤트를 등록하고 이벤트가 발생하면 커스텀 오버레이의 위치를 변경합니다 
    kakao.maps.event.addListener(polygon, 'mousemove', function (mouseEvent) {

      // customOverlay.setPosition(mouseEvent.latLng);
    });

    // 다각형에 mouseout 이벤트를 등록하고 이벤트가 발생하면 폴리곤의 채움색을 원래색으로 변경합니다
    // 커스텀 오버레이를 지도에서 제거합니다 
    kakao.maps.event.addListener(polygon, 'mouseout', function () {
      polygon.setOptions({ fillColor: '#fff' });
      customOverlay.setMap(null);
    });
    
    // 다각형에 click 이벤트를 등록하고 이벤트가 발생하면 다각형의 이름과 면적을 인포윈도우에 표시합니다 
    kakao.maps.event.addListener(polygon, 'click', function (mouseEvent) {
      console.log('object :', mouseEvent);
      var content = '<div class="info">' +
        '   <div class="title">' + name + '</div>' +
        '   <div class="size">총 면적 : 약 ' + Math.floor(polygon.getArea()) + ' m<sup>2</sup></area>' +
        '</div>';

      // infowindow.setContent(content);
      // infowindow.setPosition(mouseEvent.latLng);
      // infowindow.setMap(self.map);
    });
  }

  /**
   * 지도의 표시 될 정보를 가져온다.
   */
  getMapInfo(): Observable<firestore.QuerySnapshot> {
    return this.firebaseService.collection("mapInfo").get();
  }

  /**
   * 지도의 표시 된 정보를 저장한다.
   */
  saveMapInfo(): void {
    this.firebaseService
      .collection("mapInfo")
      .add(this.mapInfo)
      .then(() => { }, err => console.log(err));
  }

  updateMapInfo(): void {
    this.firebaseService.doc('mapInfo/' + this.mapInfo.id).update(this.mapInfo);
  }

  initMap(): void {
    let self = this;

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = function () {
      // 카카오맵 SDK가 로딩 된다면 카카오맵을 초기화한다.
      kakao.maps.load(function () {
        var container = document.getElementById('map'),
          options = {
            center: new LatLng(self.latitude, self.longitude),
            level: 13,
          };

        self.map = new kakao.maps.Map(container, options);

        self.xx();

        // kakao.maps.event.addListener(self.map, 'click', res => {
        //   if (self.isMarkerMaking) {
        //     let marker = new Marker({ position: res.latLng })

        //     marker.setMap(self.map);
        //     marker.setTitle(self.mapInfo.markers.length);

        //     // 마커에 클릭이벤트를 등록합니다
        //     kakao.maps.event.addListener(marker, 'click', function () {
        //       self.isMarkerDel = true;
        //       self.selMarker = marker;
        //     });

        //     self.mapInfo.markers.push({
        //       title: self.mapInfo.markers.length,
        //       latitude: marker.getPosition().getLat(),
        //       longitude: marker.getPosition().getLng()
        //     });

        //     self.isMarkerMaking = false;

        //     if (self.mapInfo.markers.length === 1) {
        //       self.saveMapInfo();
        //     }
        //     else if (self.mapInfo.markers.length > 1) {
        //       self.updateMapInfo();
        //     }
        //   }
        // });

        // // 맵 정보를 조회요청한다.
        // self.getMapInfo()
        //   .subscribe((res: firestore.QuerySnapshot) => {
        //     res.forEach((qDocSnap: firestore.QueryDocumentSnapshot) => {
        //       qDocSnap.data().markers.forEach((marker, idx) => {
        //         let m = new Marker({ position: new LatLng(marker.latitude, marker.longitude) })
        //         m.setMap(self.map);
        //         m.setClickable(true);
        //         m.setTitle(idx);

        //         // 마커에 클릭이벤트를 등록합니다
        //         kakao.maps.event.addListener(m, 'click', function () {
        //           self.isMarkerDel = true;
        //           self.selMarker = m;
        //         });

        //         self.mapInfo['id'] = qDocSnap.id;
        //         marker['title'] = idx;
        //         self.mapInfo.markers.push(marker);
        //       });
        //     });
        //   });
      });


    }
    script.src = 'http://dapi.kakao.com/v2/maps/sdk.js?appkey=053a5f27bc5c663c66ef4e4a721b4eb3&autoload=false';
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  test(): void {
    let idx = this.mapInfo.markers.findIndex(marker => {
      return marker.title == this.selMarker.getTitle()
    });
    this.mapInfo.markers.splice(idx, 1);
    this.selMarker.setMap(null);
    this.isMarkerDel = !this.isMarkerDel;
    this.updateMapInfo();
  }
}