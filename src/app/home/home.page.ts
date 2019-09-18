import { Component, OnInit } from '@angular/core';

import { AngularFireDatabase, QueryFn } from 'angularfire2/database';

import {
  KakaoMapsProvider,
  LatLng,
  OverlayMapTypeId,
  Marker,
  OverlayType,
  DrawingManager,
  InfoWindow,
  Places,
  LatLngBounds,
  DrawingManagerOptions,
  MarkerOptions,
  CustomOverlay,
  KakaoEvents,
  MapConfig,
  DrawingManagerMarkerOptions
} from 'kakao-maps-sdk';


interface MapInfo {
  markers: Marker[]
}
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  KaKaoJavascriptAPIKey = '9f73ccd3ff6aea1c551e765226754c34'; // kakao map 인증키
  mapConfig: MapConfig = { width: '100%', height: '100%' }; // 맵 설정
  latitude: number = 0; // 위도
  longitude: number = 0; // 경도
  isMarkerMaking: boolean = false; // 플래그

  mapInfo: any = {};
  coffeeOrders = []
  /**
   * 홈을 초기화하는 생성자이다.
   * @param _kakaoMapsProvider 카카오맵제공자
   */
  constructor(public _kakaoMapsProvider: KakaoMapsProvider,
    public db: AngularFireDatabase,
    public firebaseService: AngularFirestore
  ) {

    this.mapInfo['markers'] = [];
  }

  getCoffeeOrders() {
    this.firebaseService
      .collection("coffeeOrders")
      .get()
      .subscribe(res => {
        res.forEach(r => {
          this.coffeeOrders.push(r.data());
        })
        console.log(this.coffeeOrders);
      });
  }

  /**
   * 초기화 함수다.
   */
  ngOnInit(): void {
    this.makeMap();
    console.log(1222222)
  }

  /**
   * 지도의 표시 될 정보를 가져온다.
   */
  getMapInfo(): Observable<any> {
    return this.firebaseService
      .collection("mapInfo")
      .get()
  }


  /**
   * 지도의 표시 된 정보를 저장한다.
   */
  saveMapInfo(): void {
    this.firebaseService
      .collection("mapInfo")
      .add(this.mapInfo)
      .then(res => { }, err => console.log(err));
  }

  /**
   * 맵을 초기화 한다.
   */
  makeMap(): void {
    let self = this;
    if (navigator.geolocation) {
      // GeoLocation을 이용해서 접속 위치를 얻어온다.
      navigator.geolocation.getCurrentPosition(function (position) {
        self.latitude = position.coords.latitude;
        self.longitude = position.coords.longitude;
      });
    }

    this._kakaoMapsProvider
      .loadKakaoMapSDK(self.KaKaoJavascriptAPIKey)
      .then(
        () => {
          let mapConfig = {
            center: new LatLng(self.latitude, self.longitude),
            level: 3,
            // mapTypeId: MapTypeId.ROADMAP,
          };
          this._kakaoMapsProvider
            .init('kakaomaps-div', mapConfig)
            .then(() => {
              this._kakaoMapsProvider.addListener(this._kakaoMapsProvider.getMapInstance(), 'click', res => {
                if (self.isMarkerMaking) {
                  console.log('res :', res);
                  let marker = new Marker({ position: res.response.latLng })
                  marker.setMap(self._kakaoMapsProvider.getMapInstance());

                  self.mapInfo.markers.push({
                    latitude: marker.getPosition().getLat(),
                    longitude: marker.getPosition().getLng()
                  });

                  self.isMarkerMaking = false;
                }
              });

              self.getMapInfo()
                .subscribe(res => {
                  res.forEach(r => {
                    r.data().markers.forEach(marker => {
                      new Marker({ position: new LatLng(marker.latitude, marker.longitude) }).setMap(self._kakaoMapsProvider.getMapInstance());
                    });
                  });
                });
            })
            .catch(err => { console.log('err :', err); });
        },
        err => {
          location.reload();
          this.makeMap();
          console.log('err ', err);
        }
      )
      .catch(e => {
        console.log('catch ', e);
      });
  }
}