
const moment = require("moment-timezone");

var self = module.exports={
    main:function(message){
        if(message.content.includes("what")&& message.content.includes("time")&&
        message.content.includes("is")&& message.content.includes("it")){
            message.channel.send(moment().tz("America/Los_Angeles").format("h:mm  A")+" PDT");
            message.channel.send(moment().tz("America/New_York").format("h:mm  A")+" EST");
           
            
        }
    }
}