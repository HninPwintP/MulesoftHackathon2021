/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 10-28-2021
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public class httpCallout {
    @AuraEnabled(cacheable = false)
    public static String httpCalloutGET(String endpoint, String contentType) {
        String strResponse = null;
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('GET');
        req.setHeader('Cache-Control', 'no-cache');
        req.setHeader('accept', contentType);
        req.setHeader('Content-Type', contentType);
        HTTPResponse response = http.send(req);
        if (response.getStatusCode() == 200 ) {  
            strResponse = response.getBody();  
        } else {  
            throw new CalloutException(response.getBody());  
        } 
        return strResponse;
    }

    @AuraEnabled(cacheable = false)
    public static String httpCalloutPOST(String endpoint, String contentType, String payload) {
        String strResponse = null;
        System.debug(endpoint);
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('POST');
        req.setHeader('Cache-Control', 'no-cache');
        req.setHeader('accept', contentType);
        req.setHeader('Content-Type', contentType);
        req.setBody(payload);
        HTTPResponse response = http.send(req);
        if (response.getStatusCode() == 200 || response.getStatusCode() == 201) {  
            strResponse = response.getBody();  
        } else {  
            throw new CalloutException(response.getBody());  
        } 
        return strResponse;
    }
}