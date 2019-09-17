import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  position: any; // 위치
  mapConfig: MapConfig = { width: '100%', height: '100%' }; // 맵 설정
  flagg: boolean = true; // 플래그
  marker: Marker; // 마커
  KaKaoJavascriptAPIKey = '053a5f27bc5c663c66ef4e4a721b4eb3'; // kakao map 인증키
  latitude: number = 37.5565635644733; // 위도
  longitude: number = 126.99285865453666; // 경도
  ps: Places; // 장소
  infowindow: InfoWindow; // 정보윈도우
  manager: DrawingManager; // 그리기 관리자
  dmOptions: DrawingManagerOptions;
  // 지도에 표시된 마커 객체를 가지고 있을 배열입니다
  markers: Marker[] = [];
  overlays: CustomOverlay[] = [];

  /**
   * 홈을 초기화하는 생성자이다.
   * @param _kakaoMapsProvider 카카오맵제공자
   */
  constructor(public _kakaoMapsProvider: KakaoMapsProvider) {
    // this.ps = new Places();
    // this.infowindow = new InfoWindow({zIndex:1});
  }

  /**
   * 초기화 함수다.
   */
  ngOnInit(): void {
    this.initMap();
  }

  /**
   * 맵을 초기화 한다.
   */
  initMap(): void {
    let self = this;
    if (navigator.geolocation) {
      // GeoLocation을 이용해서 접속 위치를 얻어온다.
      navigator.geolocation.getCurrentPosition(function (position) {
        self.latitude = position.coords.latitude,
          self.longitude = position.coords.longitude;
      });
    }

    this._kakaoMapsProvider
      .loadKakaoMapSDK(this.KaKaoJavascriptAPIKey)
      .then(
        () => {
          let mapConfig = {
            center: new LatLng(33.450701, 126.570667),
            level: 3,
            // mapTypeId: MapTypeId.ROADMAP,
          };
          this._kakaoMapsProvider
            .init('kakaomaps-div', mapConfig)
            .then(() => {
              self.ps = new Places();
              self.infowindow = new InfoWindow({ zIndex: 1 });
              let option: DrawingManagerOptions = {
                map: self._kakaoMapsProvider.getMapInstance(), // Drawing Manager로 그리기 요소를 그릴 map 객체입니다
                drawingMode: [ // drawing manager로 제공할 그리기 요소 모드입니다
                  OverlayType.MARKER,
                ],
                // 사용자에게 제공할 그리기 가이드 툴팁입니다
                // 사용자에게 도형을 그릴때, 드래그할때, 수정할때 가이드 툴팁을 표시하도록 설정합니다
                guideTooltip: ['draw', 'drag', 'edit'],
                markerOptions: { // 마커 옵션입니다 
                  draggable: true, // 마커를 그리고 나서 드래그 가능하게 합니다 
                  removable: true // 마커를 삭제 할 수 있도록 x 버튼이 표시됩니다  
                },
                polylineOptions: { // 선 옵션입니다
                  draggable: true, // 그린 후 드래그가 가능하도록 설정합니다
                  removable: true, // 그린 후 삭제 할 수 있도록 x 버튼이 표시됩니다
                  editable: true, // 그린 후 수정할 수 있도록 설정합니다 
                  strokeColor: '#39f', // 선 색
                  hintStrokeStyle: 'dash', // 그리중 마우스를 따라다니는 보조선의 선 스타일
                  hintStrokeOpacity: 0.5  // 그리중 마우스를 따라다니는 보조선의 투명도
                },
                rectangleOptions: {
                  draggable: true,
                  removable: true,
                  editable: true,
                  strokeColor: '#39f', // 외곽선 색
                  fillColor: '#39f', // 채우기 색
                  fillOpacity: 0.5 // 채우기색 투명도
                },
                circleOptions: {
                  draggable: true,
                  removable: true,
                  editable: true,
                  strokeColor: '#39f',
                  fillColor: '#39f',
                  fillOpacity: 0.5
                },
                polygonOptions: {
                  draggable: true,
                  removable: true,
                  editable: true,
                  strokeColor: '#39f',
                  fillColor: '#39f',
                  fillOpacity: 0.5,
                }
              }
              self.manager = new DrawingManager(option);


            })
            .catch(err => { console.log('err :', err); });
        },
        err => {
          this.initMap();
          console.log('err ', err);
        }
      )
      .catch(e => {
        console.log('catch ', e);
      });
  }










  // 버튼 클릭 시 호출되는 핸들러 입니다
  selectOverlay(type) {
    let self = this;
    // 그리기 중이면 그리기를 취소합니다
    // self.manager.cancel();

    // 클릭한 그리기 요소 타입을 선택합니다.
    self.manager.select(OverlayType.MARKER, null);
  }

  // 버튼 클릭 시 호출되는 핸들러 입니다
  selectOverlay2(type) {
    console.log('object :', this.manager.getData(OverlayType.MARKER));
  }
}