var google = require("google");
var urbanDictionary = require("urban-dictionary");
const RESULTS_PER_PAGE = 5;
google.resultsPerPage = RESULTS_PER_PAGE;
module.exports= class InformationHandler extends Handler{
    constructor(client){
        super(client);    
    }
    processChat(message){
        var client = this.client;
        if(message.isMentioned(client.user)){
            
        }
    }

}