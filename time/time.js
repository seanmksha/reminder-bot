
const moment = require("moment");

var self = module.exports={
    main:function(message){
        if(message.content.includes("what")&& message.content.includes("time")&&
        message.content.includes("is")&& message.content.includes("it")){
            message.channel.send(moment().format("h:mm  A"));
          
        }
    }
}