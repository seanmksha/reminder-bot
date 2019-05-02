var fs = require("fs");
var content = fs.readFileSync("./privateMessage.json");
var jsonContent = JSON.parse(content);
var self = module.exports=
{
    reply:function (message){
        var messages = jsonContent.messages;
        for(let i=0; i< messages.length;++i){
            //if any conditions are false continue to check the next message
            
            var currentMessage = messages[i];
            var users = currentMessage.allowedAuthors;
            var allowed = false;
            //check if the user is listed as allowed to respond to, an empty allowed list means that the message could have been sent by anyone
            for(let j=0; j< users.length;++j){
                if(users[j]==message.member.user.id){
                    allowed=true;
                    break;
                }
            }
            if(!allowed){
                continue;
            }
            //checks to see if the message has to be case-sensitive, or if it only needs to contain certain words
            if(currentMessage.contains.length==0){
                if(currentMessage.case_sensitive && currentMessage.message!=message.content){
                    console.log("line 27");
                    continue;
                }
                else if(!currentMessage.case_sensitive && message.content.toLowerCase()!=currentMessage.message.toLowerCase()){
                    console.log("line 31");
                    continue;
                }
            }
            else{
                //Check if the message includes all words
                var valid=true;
                if(currentMessage.case_sensitive){
                    for(let j=0; j<currentMessage.contains.length;++j){
                        var word = currentMessage.contains[j];
                        if(!message.content.includes(word)){
                            valid=false;
                            break;
                        }
                    }
                }
                else{
                    //convert both to lowercase and check if they include the lowercase version of the word (case-insensitive)
                    var lowerCaseMessage = message.content.toLowerCase();
                    for(let j=0; j<currentMessage.contains.length;++j){
                        var word = currentMessage.contains[j].toLowerCase();
                        if(!lowerCaseMessage.includes(word)){
                            valid=false;
                            break;
                        }
                    }
                }
                if(!valid){
                    continue;
                }
            }
            if(messages[i].reply){
                message.reply(currentMessage.response);
            }
            else{
                message.channel.send(currentMessage.response);
            }
        }
}
};