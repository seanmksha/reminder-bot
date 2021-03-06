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

    async processChat(message){
        if(!this.isAdmin(message)){
            return;
        }
        var client = this.client;
        var lowercase = message.content.toLowerCase();
        if(message.isMentioned(client.user)&& lowercase.includes("reload")&&lowercase.includes("messages")){
           this.customMessages.forEach((custom)=>
                custom.reloadContent()
           );
           message.channel.send("Reloading Messages");
           return;     
            }
            if(message.content.startsWith("!say")){
                var phrases = message.content.split(" ");
                var chan = this.client.channels.get(phrases[1]);
                if(chan){
                    var mes = phrases.slice(2,phrases.length).join(" ");
                    chan.send(mes);
                }
            }
           
        }

    
    isAdmin(message){
        return this.Administrators.has(message.member.user.id);
    }

};