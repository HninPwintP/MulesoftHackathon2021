import { LightningElement, api, track } from 'lwc';
import httpCalloutGET from '@salesforce/apex/httpCallout.httpCalloutGET';
import httpCalloutPOST from '@salesforce/apex/httpCallout.httpCalloutPOST';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class HaikuDetail extends LightningElement {
    @api getHaikuId;
    @api getUser;
    @api mulePath;
    @track likeState = false;
    @track inputComment;
    @track commentList = [];
    @track detail = new Object();

    async connectedCallback() {
      if(this.mulePath == undefined) {
        this.mulePath = 'http://haiku-ex-api.jp-e1.cloudhub.io/api/';
      }
      if(this.getUser == undefined) {
        this.getUser = JSON.parse(window.sessionStorage.getItem('haikuUser'));
      }
      httpCalloutGET({endpoint : this.mulePath + 'haiku/' + this.getHaikuId + "?userId=" + this.getUser.userId, contentType:'application/json'})
      .then(result => {
        this.detail = JSON.parse(result);
        this.showError = false;
      })
      .catch(error => {
        const evt = new ShowToastEvent({
          title: 'Error Occurred',
          message: error.message,
          variant: 'error',
          mode: 'dismissable'
        });
        this.dispatchEvent(evt);
      });

      httpCalloutGET({endpoint : this.mulePath + 'Comment?haikuid=' + this.getHaikuId, contentType:'application/json'})
      .then(result => {
        this.commentList = JSON.parse(result);
        console.log(this.commentList);
      })
      .catch(error => {
        console.log(error);
      });
    }

    returnToListView() {
      const event = new CustomEvent('return', {
      // detail contains only primitives
      detail: {key1:"ranbir",key2:"Das"}
      });
      console.log(event);
      this.dispatchEvent(event);
    }

    isSelected = false;

    handleClick() {
      this.isSelected = !this.isSelected;
    }

    // ----------------
    @track isTopModalOpen = false;
    @track isMidModalOpen = false;
    @track isBtmModalOpen = false;
    @track parentHaikuId = null;
    modalHaiku_Top;
    modalHaiku_Mid;
    modalHaiku_Btm;
    modalHaiku_Tran_Top;
    modalHaiku_Tran_Mid;
    modalHaiku_Tran_Btm;
    index;

    openTopModal() {
      this.modalHaiku_Top = this.detail.Content;
      this.isTopModalOpen = true;
    }

    openMidModal(event) {
      this.modalHaiku_Top = this.detail.Content;
      this.modalHaiku_Mid = event.target.label;
      console.log('event');
      console.log(event.target.title);
      this.index = event.target.title;
      this.isMidModalOpen = true;
      this.parentHaikuId = event.target.value;
    }

    openBtmModal(event) {
      this.isBtmModalOpen = true;
      this.modalHaiku_Top = this.detail.Content;
      this.modalHaiku_Tran_Top = this.detail.TranslateContent;

      this.modalHaiku_Mid = event.target.value;
      console.log('modalHaiku_Mid:' + event.target.value);
      this.modalHaiku_Tran_Mid = event.target.title;
      console.log('modalHaiku_Tran_Mid:' + event.target.title);

      this.modalHaiku_Btm = event.target.label;
      console.log('modalHaiku_Btm:' + event.target.label);
      this.modalHaiku_Tran_Btm = event.target.name;
      console.log('modalHaiku_Tran_Btm:' + event.target.name);
    }

    closeTopModal() {
      this.isTopModalOpen = false;
    }
    closeMidModal() {
      this.isMidModalOpen = false;
    }
    closeBtmModal() {
      this.isBtmModalOpen = false;
    }

    // ----------------
    handleMidHaikuChange(event) {
      this.midHaiku = event.target.value;
    }
    handleBtmHaikuChange(event) {
      this.btmHaiku = event.target.value;
    }

    // 中の句をPOST
    midHaikuPost() {
      if(this.midHaiku == null) {
          this.showError = true;
          this.errorMessage = 'Please enter the required value.';
          return;
      }
      const haikuObj = {
        "Content": this.midHaiku,
        "UserId": this.getUser.userId,
        "level": "mid",
        "OriginalLanguage": this.getUser.language,
        "ParentHaikuId": this.getHaikuId,
      }

      if(this.getUser.language == 'ja') {
        haikuObj.targetLanguage = 'en';
      } else {
        haikuObj.targetLanguage = 'ja';
      }

      httpCalloutPOST({endpoint : this.mulePath + 'haiku', contentType:'application/json', payload:  JSON.stringify(haikuObj)})
      .then(result => {
        this.isTopModalOpen = false;
        const resultObj = JSON.parse(result);
        resultObj.VoteTotal = null;
        this.detail.haiku_mid.push(resultObj);
      })
      .catch(error => {
        const evt = new ShowToastEvent({
          title: 'Error Occurred',
          message: error.message,
          variant: 'error',
          mode: 'dismissable'
        });
        this.dispatchEvent(evt);
      });
    }

    // 下の句をPOST
    btmHaikuPost() {
      if(this.btmHaiku == null) {
          this.showError = true;
          this.errorMessage = 'Please enter the required value.';
          return;
      }
      const haikuObj = {
        "Content": this.btmHaiku,
        "UserId": this.getUser.userId,
        "level": "btm",
        "OriginalLanguage": this.getUser.language,
        "ParentHaikuId": this.parentHaikuId
      }

      if(this.getUser.language == 'ja') {
        haikuObj.targetLanguage = 'en';
      } else {
        haikuObj.targetLanguage = 'ja';
      }

      httpCalloutPOST({endpoint : this.mulePath + 'haiku', contentType:'application/json', payload:  JSON.stringify(haikuObj)})
      .then(result => {
        this.isMidModalOpen = false;
        const resultObj = JSON.parse(result);
        resultObj.VoteTotal = null;
        this.detail.haiku_mid[this.index].haiku_btm.push(resultObj);
      })
      .catch(error => {
        const evt = new ShowToastEvent({
          title: 'Error Occurred',
          message: error.message,
          variant: 'error',
          mode: 'dismissable'
        });
        this.dispatchEvent(evt);
      });
    }

    // いいね投票をPOST
    handleLikeButtonClick(event) {
      const midIndex = event.target.name;
      const midObj = this.detail.haiku_mid[midIndex];
      const voteObj = {
        "HaikuId": event.target.value,
        "UserId": this.getUser.userId,
        "ParentHaikuId": this.getHaikuId
      }

      httpCalloutPOST({endpoint : this.mulePath + 'Vote', contentType:'application/json', payload: JSON.stringify(voteObj)})
      .then(result => {
        midObj.IsVoted = true;
        midObj.VoteTotal = midObj.VoteTotal + 1;
      })
      .catch(error => {
        console.log(error);
        const evt = new ShowToastEvent({
          title: 'Error Occurred',
          message: error.message,
          variant: 'error',
          mode: 'dismissable'
        });
        this.dispatchEvent(evt);
      });
    }

    handleLikeButtonClickBtm(event) {
      const midIndex = event.target.value;
      const btmIndex = event.target.name;
      const btmObj = this.detail.haiku_mid[midIndex].haiku_btm[btmIndex];
      const voteObj = {
        "HaikuId": btmObj.HaikuId,
        "UserId": this.getUser.userId,
        "ParentHaikuId": this.getHaikuId
      }

      httpCalloutPOST({endpoint : this.mulePath + 'Vote', contentType:'application/json', payload: JSON.stringify(voteObj)})
      .then(result => {
        btmObj.IsVoted = true;
        btmObj.VoteTotal = btmObj.VoteTotal + 1;
      })
      .catch(error => {
        console.log(error);
        const evt = new ShowToastEvent({
          title: 'Error Occurred',
          message: error.message,
          variant: 'error',
          mode: 'dismissable'
        });
        this.dispatchEvent(evt);
      });
    }

    changeComment(event) {
      this.postCommentValue = event.target.value;
    }

    // コメントをPOST
    commentPost() {
      if(this.postCommentValue == null) {
          this.showError = true;
          this.errorMessage = 'Please enter the required value.';
          return;
      }
      const commentObj = {
        "HaikuId": this.getHaikuId,
        "UserId": this.getUser.userId,
        "Comment": this.postCommentValue
      }

      httpCalloutPOST({endpoint : this.mulePath + 'Comment', contentType:'application/json', payload: JSON.stringify(commentObj)})
      .then(result => {
        this.showError = false;
        this.commentList = JSON.parse(result);
        this.template.querySelector('lightning-textarea[data-name="comment-input"]').value = null;
        console.log('haikuPos = ' + result);
      })
      .catch(error => {
        console.log(error);
        const evt = new ShowToastEvent({
          title: 'Error Occurred',
          message: error.message,
          variant: 'error',
          mode: 'dismissable'
        });
        this.dispatchEvent(evt);
      });
    }

}