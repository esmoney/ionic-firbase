import { Component, OnInit } from '@angular/core';
import {
  KakaoMapsProvider,
  LatLng,
  MapTypeId,
  MapTypeControl,
  ControlPosition,
  OverlayMapTypeId,
  KakaoEvents,
  Marker,
  OverlayType,
  DrawingManager,
  Toolbox,
  KeywordSearchOptions,
  AddressSearchOptions,
  Geocoder,
  InfoWindow,
  Viewpoint,
  Places,
  LatLngBounds
} from 'kakao-maps-sdk';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  position: any; // 위치
  mapConfig: any = { width: '100%', height: '93.3%' }; // 맵 설정
  flagg: boolean = true; // 플래그
  marker: Marker; // 마커
  KaKaoJavascriptAPIKey = '053a5f27bc5c663c66ef4e4a721b4eb3'; // kakao map 인증키
  latitude: number = 37.5565635644733; // 위도
  longitude: number = 126.99285865453666; // 경도
  ps: Places; // 장소
  infowindow: InfoWindow; // 정보윈도우
  // ps: Places = new Places(); // 장소
  // infowindow = new InfoWindow({zIndex:1}); // 정보윈도우
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
            level: 4,
            center: new LatLng(37.5565635644733, 126.99285865453666),
            mapTypeId: MapTypeId.ROADMAP,
          };
          this._kakaoMapsProvider
            .init('kakaomaps-div', mapConfig)
            .then(() => {
              this._kakaoMapsProvider.getMapInstance().addControl(new MapTypeControl(), ControlPosition.TOP);
              // _kakaoMapsProvider.getMapInstance().addOverlayMapTypeId(OverlayMapTypeId.);

              let events: KakaoEvents[] = [
                'center_changed',
                'zoom_start',
                'zoom_changed',
                'bounds_changed',
                'click',
                'dblclick',
                'rightclick',
                'mousemove',
                'dragstart',
                'drag',
                'dragend',
                'idle',
                'tilesloaded',
                'maptypeid_changed',
              ];
              this._kakaoMapsProvider.addListeners(this._kakaoMapsProvider.getMapInstance(), events, res => {
                // if(res.event == 'click'){}
                // console.log(res);
              });

              this.marker = new Marker({ position: new LatLng(37.5565635644733, 126.99285865453666) });
              self.displayMarker2(new LatLng(this.latitude, this.longitude), null);
            })
            .catch();
        },
        err => {
          console.log('err ', err);
        }
      )
      .catch(e => {
        console.log('catch ', e);
      });

    // _kakaoMapsProvider.getMapInstance().addControl(_kakaoMapsProvider.getZoomControl(), ControlPosition.TOPRIGHT);
    // _kakaoMapsProvider.getMapInstance().addControl(_kakaoMapsProvider.getMapTypeControl(), ControlPosition.TOPRIGHT);
  }

  // 키워드 검색 완료 시 호출되는 콜백함수 입니다
  placesSearchCB(data, status, pagination) {
    if (status === 200) {

      // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
      // LatLngBounds 객체에 좌표를 추가합니다
      var bounds = new LatLngBounds(null, null);

      for (var i = 0; i < data.length; i++) {
        this.displayMarker(data[i]);
        bounds.extend(new LatLng(data[i].y, data[i].x));
      }

      // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
      this._kakaoMapsProvider.getMapInstance().setBounds(bounds);
    }
  }

  // 지도에 마커를 표시하는 함수입니다
  displayMarker(place, infowindow?) {
    let self = this;
    // 마커를 생성하고 지도에 표시합니다
    let marker = new Marker({map: this._kakaoMapsProvider.getMapInstance(), position: new LatLng(place.y, place.x) });

    // 마커에 클릭이벤트를 등록합니다
    self._kakaoMapsProvider.addListeners(marker, ['click'], function () {
      // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
      infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
      infowindow.open(self._kakaoMapsProvider.getMapInstance(), marker);
    });
  }

  // /**
  //  * 지도에 마커와 인포윈도우를 표시한다.
  //  * @param locPosition 위치정보
  //  * @param message 표시 메시지
  //  */
  displayMarker2(locPosition: LatLng, message: string): void {
    this.marker.setMap(this._kakaoMapsProvider.getMapInstance());
    this.marker.setPosition(locPosition);

    // var iwContent = message, // 인포윈도우에 표시할 내용
    //   iwRemoveable = true;

    // // 인포윈도우를 생성합니다
    // var infowindow = new InfoWindow({
    //   content: iwContent,
    //   removable: iwRemoveable
    // });

    // // 인포윈도우를 마커위에 표시합니다 
    // infowindow.open(this._kakaoMapsProvider.getMapInstance(), this.marker);

    // 지도 중심좌표를 접속위치로 변경합니다
    this._kakaoMapsProvider.getMapInstance().setCenter(locPosition);
  }

  searchWhere(address: string): void {
    let self = this;
    let ps = new Places();
    let infowindow = new InfoWindow({ zIndex: 1 });
    ps.keywordSearch('이태원 맛집', (data, status, pagination) => {
      if (status === "OK") {

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        var bounds = new LatLngBounds(null, null);

        for (var i = 0; i < data.length; i++) {
          this.displayMarker(data[i], infowindow);
          bounds.extend(new LatLng(data[i].y, data[i].x));
        }

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        this._kakaoMapsProvider.getMapInstance().setBounds(bounds);
      }
    }, null);
    // //TODO 검색목록을 팝업에 표시 후 위치 클릭 시 해당위치로 맵 이동
    // new Places().keywordSearch('행당 대림아파트', (result, status) => {
    //   console.log('result :', result);
    // }, null);


    // // 도형 스타일을 변수로 설정합니다
    // var strokeColor = '#39f',
    //   fillColor = '#cce6ff',
    //   fillOpacity = 0.5,
    //   hintStrokeStyle = 'dash';

    // var options = {
    //   // Drawing Manager를 생성할 때 사용할 옵션입니다
    //   map: this._kakaoMapsProvider.getMapInstance(), // Drawing Manager로 그리기 요소를 그릴 map 객체입니다
    //   drawingMode: [
    //     OverlayType.MARKER,
    //     OverlayType.ARROW,
    //     OverlayType.POLYLINE,
    //     OverlayType.RECTANGLE,
    //     OverlayType.CIRCLE,
    //     OverlayType.ELLIPSE,
    //     OverlayType.POLYGON,
    //   ],
    //   // 사용자에게 제공할 그리기 가이드 툴팁입니다
    //   // 사용자에게 도형을 그릴때, 드래그할때, 수정할때 가이드 툴팁을 표시하도록 설정합니다
    //   guideTooltip: ['draw', 'drag', 'edit'],
    //   markerOptions: {
    //     draggable: true,
    //     removable: true,
    //   },
    //   arrowOptions: {
    //     draggable: true,
    //     removable: true,
    //     strokeColor: strokeColor,
    //     hintStrokeStyle: hintStrokeStyle,
    //   },
    //   polylineOptions: {
    //     draggable: true,
    //     removable: true,
    //     strokeColor: strokeColor,
    //     hintStrokeStyle: hintStrokeStyle,
    //   },
    //   rectangleOptions: {
    //     draggable: true,
    //     removable: true,
    //     strokeColor: strokeColor,
    //     fillColor: fillColor,
    //     fillOpacity: fillOpacity,
    //   },
    //   circleOptions: {
    //     draggable: true,
    //     removable: true,
    //     strokeColor: strokeColor,
    //     fillColor: fillColor,
    //     fillOpacity: fillOpacity,
    //   },
    //   ellipseOptions: {
    //     draggable: true,
    //     removable: true,
    //     strokeColor: strokeColor,
    //     fillColor: fillColor,
    //     fillOpacity: fillOpacity,
    //   },
    //   polygonOptions: {
    //     draggable: true,
    //     removable: true,
    //     strokeColor: strokeColor,
    //     fillColor: fillColor,
    //     fillOpacity: fillOpacity,
    //   },
    // };

    // // 위에 작성한 옵션으로 Drawing Manager를 생성합니다
    // var manager = new DrawingManager(options);

    // // Toolbox를 생성합니다.
    // // Toolbox 생성 시 위에서 생성한 DrawingManager 객체를 설정합니다.
    // // DrawingManager 객체를 꼭 설정해야만 그리기 모드와 매니저의 상태를 툴박스에 설정할 수 있습니다.
    // var toolbox = new Toolbox({ drawingManager: manager });

    // // 지도 위에 Toolbox를 표시합니다
    // // daum.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOP은 위 가운데를 의미합니다.
    // this._kakaoMapsProvider.getMapInstance().addControl(toolbox.getElement(), ControlPosition.TOP);
  }

  removeMarker() {
    this.marker.setMap(null);
  }
  addMarker() {
    this.marker.setMap(this._kakaoMapsProvider.getMapInstance());
  }

  getPosition() {
    this.position = this._kakaoMapsProvider.getMapInstance().getCenter();
    this.marker = new Marker({ position: this.position });
  }

  addOverlay() {
    this._kakaoMapsProvider.getMapInstance().addOverlayMapTypeId(OverlayMapTypeId.TRAFFIC);
  }
  removeOverlay() {
    this._kakaoMapsProvider.getMapInstance().removeOverlayMapTypeId(OverlayMapTypeId.TRAFFIC);
  }

  changeLayout() {
    let option = {
      width: '100%',
      height: '50%',
    };
    if (this.flagg) {
      option = {
        width: '100%',
        height: '50%',
      };
    } else {
      option = {
        width: '100%',
        height: '95%',
      };
    }
    this.mapConfig = option;
    this.flagg = !this.flagg;
  }

}
