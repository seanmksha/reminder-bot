
const moment = require("moment-timezone");

var self = module.exports={
    main:function(message,client){
        var lowercase = message.content.toLowerCase();
        if(lowercase.includes("what")&& lowercase.includes("time")&&
        lowercase.includes("is")&& lowercase.includes("it")){
            message.channel.send(moment().tz("America/Los_Angeles").format("h:mm  A")+" PDT");
            message.channel.send(moment().tz("America/New_York").format("h:mm  A")+" EST");
        }
        let user = message.mentions.users.first();
        if(message.isMentioned(client.user)&& lowercase.includes("remind")&&lowercase.includes("me")){
            var res = lowercase.split(" ");
            let hour = 0;
            for(let i=0; i<res.length;++i){
                if(res[i].includes("hour")){
                    if(i==0){
                        continue;
                    }
                    hour=res[i-1];
                    if(res[i-1]=="a"){
                        hour=1;
                    }
                    break;
                }
            }
            let minute = 0;
            for(let i=0; i<res.length;++i){
                if(res[i].includes("minute")){
                    if(i==0){
                        continue;
                    }
                    minute=res[i-1];
                    if(res[i-1]=="a"){
                        minute=1;
                    }
                    break;
                }
            }
            let second = 0;
            for(let i=0; i<res.length;++i){
                if(res[i].includes("second")){
                    if(i==0){
                        continue;
                    }
                    second=res[i-1];
                    if(res[i-1]=="a"){
                        second=1;
                    }
                    break;
                }
            }
            if(lowercase.includes("tomorrow")){
                hour=24;
            }
            message.channel.send("Need to set reminder for "+ hour+" hours,  "+minute+" minutes, and "+second+" seconds from now. (Not implemented yet)");
        }

    }
}