import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import {
  KakaoMapsProvider,
  LatLng,
  Marker,
  MapConfig,
  MarkerOptions
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

  map;
  width = { width: 350 + 'px', height: 100 + '%' };
  isMarkerDel: boolean = false;
  selMarker: Marker;
  /**
   * 홈을 초기화하는 생성자이다.
   * @param _kakaoMapsProvider 카카오맵제공자
   */
  constructor(public _kakaoMapsProvider: KakaoMapsProvider,
    public db: AngularFireDatabase,
    public firebaseService: AngularFirestore
  ) {
    let self = this;
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
            center: new kakao.maps.LatLng(self.latitude, self.longitude),
            level: 3,
          };

        self.map = new kakao.maps.Map(container, options);

        kakao.maps.event.addListener(self.map, 'click', res => {
          if (self.isMarkerMaking) {
            let marker = new Marker({ position: res.latLng })

            marker.setMap(self.map);
            marker.setTitle(self.mapInfo.markers.length);

            // 마커에 클릭이벤트를 등록합니다
            kakao.maps.event.addListener(marker, 'click', function () {
              self.isMarkerDel = true;
              self.selMarker = marker;
            });

            self.mapInfo.markers.push({
              title: self.mapInfo.markers.length,
              latitude: marker.getPosition().getLat(),
              longitude: marker.getPosition().getLng()
            });

            self.isMarkerMaking = false;

            if (self.mapInfo.markers.length === 1) {
              self.saveMapInfo();
            }
            else if (self.mapInfo.markers.length > 1) {
              self.updateMapInfo();
            }
          }
        });

        // 맵 정보를 조회요청한다.
        self.getMapInfo()
          .subscribe((res: firestore.QuerySnapshot) => {
            res.forEach((qDocSnap: firestore.QueryDocumentSnapshot) => {
              qDocSnap.data().markers.forEach((marker, idx) => {
                let m = new Marker({ position: new LatLng(marker.latitude, marker.longitude) })
                m.setMap(self.map);
                m.setClickable(true);
                m.setTitle(idx);

                // 마커에 클릭이벤트를 등록합니다
                kakao.maps.event.addListener(m, 'click', function () {
                  self.isMarkerDel = true;
                  self.selMarker = m;
                });

                self.mapInfo['id'] = qDocSnap.id;
                marker['title'] = idx;
                self.mapInfo.markers.push(marker);
              });
            });
          });
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