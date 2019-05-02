var fs = require("fs");
var content = fs.readFileSync("./privateMessage.json");
var jsonContent = JSON.parse(content);
var self = module.exports=
{
    reply:function (message){
        var messages = jsonContent.messages;
        for(let i=0; i< messages.length;++i){
            //if any conditions are false continue
            var valid=true;
            var users = messages[i].allowedAuthors;
            var allowed = false;
            for(let j=0; j< users.length;++j){
                if(users[j]==message.member.user.id){
                    allowed=true;
                    break;
                }
            }
            if(!allowed){
                continue;
            }
            if(messages[i].case-sensitive && messages[i].message!=message.content){
                continue;
            }
            else if(!messages[i].case-sensitive && message.content.toLowerCase()!=messages[i].message.toLowerCase()){
                continue;
            }
            if(messages[i].reply){
                message.reply(messages[i].response);
            }
            else{
                message.channel.send(messages[i].response);
            }



        }
}
};