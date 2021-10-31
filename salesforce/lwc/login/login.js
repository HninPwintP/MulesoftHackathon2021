import { LightningElement,track,api } from "lwc";
import httpCalloutGET from '@salesforce/apex/httpCallout.httpCalloutGET';
import httpCalloutPOST from '@salesforce/apex/httpCallout.httpCalloutPOST';
import headerBackground from '@salesforce/resourceUrl/background';

export default class Login extends LightningElement {
  @track inputUserName;
  @track inputPassword;
  @track showSpinner = false;
  @track issignup = false;
  @track isListView = false;
  @api userName;
  @api user;
  @track showError = false;
  errorMessage;
  headerBackgroundImg = headerBackground;

  login() {

    if(this.inputUserName == null || this.inputPassword == null) {
        this.showError = true;
        this.errorMessage = 'Please enter userName and Password.';
        return;
    }

    httpCalloutGET({endpoint : 'http://haiku-ex-api.jp-e1.cloudhub.io/api/auth?username=' + this.inputUserName + '&password=' + this.inputPassword, contentType:'application/json'})
    .then(result => {
      this.isListView = true;
      this.showError = false;
      window.sessionStorage.setItem('haikuUser',result);
      this.user = JSON.parse(result);
    })
    .catch(error => {
        console.log(error);
        this.showError = true;
        this.errorMessage = 'The username and password did not match.Please double-check and try again.';
    }); 
  }

  handleUserNameChange(event) {
      this.inputUserName = event.target.value;
  }

  handlePasswordChange(event) {
      this.inputPassword = event.target.value;
  }

  @track inputNickName;
  @track inputLanguage;
  @track Language;

  Language = 'ja';
  LanguageList = [
      { label: 'Japanese', value: 'ja' },
      { label: 'English', value: 'en' },
  ];

  

  signup() {
    if(this.inputUserName == null || this.inputPassword == null || this.inputNickName== null) {
        this.showError = true;
        this.errorMessage = 'Please enter the required value.';
        return;
    }
    
    const userObj = {
      "username": this.inputUserName,
      "password": this.inputPassword,
      "nickName": this.inputNickName,
      "language": 'ja'
    }
    httpCalloutPOST({endpoint : 'http://haiku-ex-api.jp-e1.cloudhub.io/api/user', contentType:'application/json', payload:  JSON.stringify(userObj)})
    .then(result => {
      this.isListView = true;
      this.showError = false;
      window.sessionStorage.setItem('haikuUser',result);
      this.user = JSON.parse(result);
    })
    .catch(error => {
        console.log(error);
        this.showError = true;
        this.errorMessage = error.body.message;
    }); 
}

  get LanguageOptions() {
      return this.LanguageList;
  }

  handleNickNameChange(event) {
      this.inputNickName = event.target.value;
  }

  handleLanguageChange(event) {
      this.inputLanguage = event.target.value;
  }

  signupflg() {
      this.issignup = true;
      this.showError = false;
      this.template.querySelector('lightning-input[data-name="inputUserName"]').value = null;
      this.template.querySelector('lightning-input[data-name="inputPassword"]').value = null;
  }

  alreadyHaveAccount() {
    this.issignup = false;
    this.showError = false;
    this.template.querySelector('lightning-input[data-name="inputUserName"]').value = null;
    this.template.querySelector('lightning-input[data-name="inputPassword"]').value = null;
  }

  connectedCallback() {
    this.user = JSON.parse(window.sessionStorage.getItem('haikuUser'));
    if(this.user != undefined) {
      this.isListView = true;
    }
  }
}