import { LightningElement, track, api } from "lwc";
import httpCalloutGET from '@salesforce/apex/httpCallout.httpCalloutGET';
import httpCalloutPOST from '@salesforce/apex/httpCallout.httpCalloutPOST';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ListView extends LightningElement {
  
  @track inputLanguage;
  @track Language;
  @api getUser;
  @track trendList = [];
  @track LatestList = [];
  showTranslate;
  signin(event) {
      this.clickedButtonLabel = event.target.label;
  }

  Language = 'ja';
  LanguageList = [
      { label: 'Japanese', value: 'ja' },
      { label: 'English', value: 'en' },
  ];
  @api haikuId;
  @track showDetail=false;
  @track topHaiku;

  get LanguageOptions() {
      return this.LanguageList;
  }

  async connectedCallback() {
    if(this.getUser == undefined) {
      this.getUser = JSON.parse(window.sessionStorage.getItem('haikuUser'));
    }
    
    httpCalloutGET({endpoint : 'http://haiku-ex-api.jp-e1.cloudhub.io/api/haiku?viewType=Trend', contentType:'application/json'})
    .then(result => {
      this.trendList = JSON.parse(result);
      //this.showError = false;
    })
    .catch(error => {
      // transit to error page
      //this.showError = false;
    }); 

    httpCalloutGET({endpoint : 'http://haiku-ex-api.jp-e1.cloudhub.io/api/haiku?viewType=Latest', contentType:'application/json'})
    .then(result => {
      this.LatestList = JSON.parse(result);
      //this.showError = false;
    })
    .catch(error => {
      // transit to error page
      //this.showError = false;
    }); 
  }

  handletopHaikuChange(event) {
    this.topHaiku = event.target.value;
  }

  handleLanguageChange(event) {
    this.Language = event.target.value;
  }

  postHaiku(){
    if(this.topHaiku == null) {
        this.showError = true;
        this.errorMessage = 'Please enter the required value.';
        return;
    }

    const haikuObj = {
      "Content": this.topHaiku,
      "UserId": this.getUser.userId,
      "level": "top",
      "OriginalLanguage": this.Language
    }

    if(this.Language == 'ja') {
      haikuObj.targetLanguage = 'en';
    } else {
      haikuObj.targetLanguage = 'ja';
    }
    console.log(haikuObj);
    httpCalloutPOST({endpoint : 'http://haiku-ex-api.jp-e1.cloudhub.io/api/haiku', contentType:'application/json', payload:  JSON.stringify(haikuObj)})
    .then(result => {
      this.showError = false;
      this.userName = this.inputUserName;
      this.template.querySelector('lightning-input[data-name="topHaiku"]').value = null;
      const evt = new ShowToastEvent({
        title: 'Haiku Created.',
        message: 'Haiku created sucessfully',
        variant: 'success',
        mode: 'dismissable'
      });
      this.dispatchEvent(evt);
      this.LatestList.unshift(JSON.parse(result));
      
      this.trendList.push(JSON.parse(result));//DBをもう一度呼び出すべきか？？？
      console.log(this.LatestList);
    })
    .catch(error => {
        console.log(error);
        this.showError = true;
        this.errorMessage = error.body.message;
    }); 

  }

  handleClick(event) {
    this.showDetail = true;
    this.haikuId = event.target.title;
  }

  progressValueChange() {
    console.log('progressValueChange');
    this.showDetail = false;
  }

  changeLanguage() {
    console.log(this.Language);
    if(this.Language == 'ja') {
      this.showTranslate = false;
    } else {
      this.showTranslate = true;
    }
    
  }
}