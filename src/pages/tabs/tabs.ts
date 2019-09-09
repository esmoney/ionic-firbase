import { Component } from '@angular/core';
import { HomePage } from 'src/app/home/home.page';
import { ListPage } from 'src/app/list/list.page';
 
// import { HomePage } from '../../app/home/home';
// import { ListPage } from '../list/list';
// import { ProfilePage } from '../profile/profile';


 
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = HomePage;
  tab2Root: any = ListPage;
//   tab3Root: any = ProfilePage;
 
  constructor() {
 
  }
}
