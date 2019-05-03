const Handler = require("../handler.js");
module.exports = class AdminHandler extends Handler{


    constructor(client){
        super(client);
        //enter administrators id's
        this.Administrators = new Set([
            "117506222575452163",
            "232599207956054016"
        ]);
        this.customMessages=[];
        for(let i=1; i<arguments.length;++i){
            this.customMessages.push(arguments[i]);
        }
    }

    processChat(message){
        if(!this.isAdmin(message)){
            return;
        }
        var client = this.client;
        var lowercase = message.content.toLowerCase();
        if(message.isMentioned(client.user)&& lowercase.includes("reload")&&lowercase.includes("messages")){
           this.customMessages.forEach((custom)=>
                custom.reloadContent()
           );
           message.channel.send("Yes, sir! Reloading Messages");
           return;     
            }
           
        }

    
    isAdmin(message){
        return this.Administrators.has(message.member.user.id);
    }

};