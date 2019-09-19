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
  }

  /**
   * 초기화 함수다.
   */
  ngOnInit(): void {
    // this.makeMap();
		var container = document.getElementById('map');
		var options = {
			center: new kakao.maps.LatLng(33.450701, 126.570667),
			level: 3
		};

		var map = new kakao.maps.Map(container, options);
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

  /**
   * 맵을 초기화 한다.
   */
  makeMap(): void {
    let self = this;

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
                  let marker = new Marker({ position: res.response.latLng })
                  marker.setMap(self._kakaoMapsProvider.getMapInstance());

                  self.mapInfo.markers.push({
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

              self.getMapInfo()
                .subscribe((res: firestore.QuerySnapshot) => {
                  res.forEach((qDocSnap: firestore.QueryDocumentSnapshot) => {
                    qDocSnap.data().markers.forEach(marker => {
                      let m = new Marker({ position: new LatLng(marker.latitude, marker.longitude) })
                      m.setMap(self._kakaoMapsProvider.getMapInstance());
                      m.setClickable(true);
                      self.mapInfo['id'] = qDocSnap.id;
                      self.mapInfo.markers.push(marker);
                    });
                  });
                });
            })
            .catch(err => {
              console.log('err1 :', err);
              self.makeMap();
            });
        },
        err => {
          self.makeMap();
          console.log('err2 ', err);
        }
      )
      .catch(e => {
        self.makeMap();
        console.log('catch3 ', e);
      });
  }

  test(): void {
    this.isShowToolBox = !this.isShowToolBox;
  }
}