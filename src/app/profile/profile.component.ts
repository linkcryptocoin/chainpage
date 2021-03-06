import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { ToasterService } from 'angular2-toaster';
import { OothService } from '../_services';
import { TranslateService } from '@ngx-translate/core';
import { SupoerNode } from '../_models/index'
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  regionDisplayName: string = null;
  inEdit = false;
  model: any = {};
  showPassword = false;
  userName: string;
  tokenBalance: number;
  accountNumber: string;
  profilePages: string[];
  selectedPage: string;
  accountEmail: string;
  toAddress: string;
  token: number;
  supernodes: SupoerNode[];
  
  constructor(private oothService: OothService, private route: ActivatedRoute
    , private toasterService: ToasterService, private translate: TranslateService) {
    this.accountNumber = sessionStorage.getItem("currentUserAccount");
    this.accountEmail = sessionStorage.getItem("currentUserEmail");
    this.route.queryParams.subscribe(params => {
      this.userName = params["user"];
    });
    this.profilePages = new Array("Account Information", "Account Settings");
    this.selectedPage = this.profilePages[0];
    //get user data
    this.oothService.getUser()
      .then(res =>{
        this.model = res;
        console.log(this.model.local)
        console.log(this.model.local.region)
      });
    this.oothService.getInfo()
      .then(res => {
        // console.log(res.supernodes);
        this.supernodes = [];
        for (let node of res.supernodes) {
          for (let key in node) {
            console.log("      key:", key, "value:", node[key]);
            this.supernodes.push(new SupoerNode(key, node[key]));
            //get region display string
            if(this.model.local.region === key){
              this.regionDisplayName = node[key];
            }
          }
        }
        // this.supernodes.forEach(node => {
        //   console.log(node.key + ":" + node.region);
        // });
      });
    // let balanceSession = sessionStorage.getItem('tokenBalance');
    //     if (balanceSession) {
    //       this.tokenBalance = Number.parseFloat(balanceSession);
    //       console.log("session balance=" + balanceSession)
    //     }
    //     else {
    //       this.oothService.getTokenBalance(this.accountNumber)
    //         .then(balance => {
    //           console.log("balance=" + balance)
    //           this.tokenBalance = balance;
    //         });
    //     }
  }
  togglePass() {
    this.showPassword = !this.showPassword;
  }
  sendToken() {
    //if(confirm("Are you sure you want to transfer tokens to another account?")) {
    //alert("Sending..")
    console.log(this.token)
    this.oothService.transferToken(this.toAddress, this.token)
      .then(res => {
        if (res.status == 200) {
          this.translate.get('Tokens transferred successfully!')
            .subscribe(trans => {
              console.log(trans);
              this.toasterService.pop("success", "Tokens transferred successfully!");
            });
        }
        else {
          this.translate.get('Failed to transfer tokens!')
            .subscribe(trans => {
              console.log(trans);
              this.toasterService.pop("error", "Failed to transfer tokens!");
            });
        }
      });
    //}    
  }
  onPageClick(value) {
    // console.log(value);
    this.selectedPage = value.trim();
  }
  updateProfile(){
    this.inEdit = !this.inEdit;
    if(!this.inEdit){
      console.log(this.model.local.region);
      this.oothService.onUpdateUser(this.model.local.region)
      .then(() => {this.getRegionDisplayNameByKey(this.model.local.region);});
    }
  }
  getRegionDisplayNameByKey(key: string) {
    for (let node of this.supernodes) {     
        //get region display string
        if(node.key === key){
          this.regionDisplayName = node.region;
          return;        
      }
    }
  }
  ngOnInit() {
    this.oothService.getTokenBalance(this.accountNumber)
      .then(balance => {
        console.log("balance=" + balance)
        this.tokenBalance = balance;
      });
  }

}
