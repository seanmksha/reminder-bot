const Handler = require("../handler.js");
module.exports= class CustomMessages extends Handler{
    constructor(client,directory){
        super(client);
        const {Random} = require("random-js");
        this.fs = require("fs");
        this.directory=directory;
        this.content = this.fs.readFileSync(directory);
        this.jsonContent = JSON.parse(this.content);
        this.random = new Random();
        this.debug=false;
    }
    reloadContent(){
        this.content = this.fs.readFileSync(this.directory);
        this.jsonContent = JSON.parse(this.content);
        console.log("Commands Reloaded");
    }

    attachIsImage(msgAttach) {
        var url = msgAttach.url;
        return ((url.indexOf("png", url.length - "png".length /*or 3*/) !== -1)||(url.indexOf("jpg",url.length-"jpg".length)!==-1)||
        (url.indexOf("jpeg",url.length-"jpeg".length)!==-1)||(url.indexOf("gif",url.length-"gif".length)!==-1));
    }

    

    async processChat(message){
        var messages = this.jsonContent.messages;
        var client = this.client;
        for(let i=0; i< messages.length;++i){
            
            //if any conditions are false continue to check the next message
            var currentMessage = messages[i];
            var users = currentMessage.allowedAuthors;
            var allowed = false;
            if(this.debug)console.log("entering check for "+currentMessage.message);
            //check if mention
            if(!message.isMentioned(client.user)&& currentMessage.mention){
                //console.log("failed mention check");
                continue;
            }
            //check channels
            var channelValid = false;
            if(currentMessage.channel.length==0){
                channelValid=true;
            }
            currentMessage.channel.forEach(element => {
                if(element==message.channel.id){
                    channelValid=true;
                }
            });
            if(!channelValid){
                //console.log("wrong channel");
                continue;
            }
            //check image
            if(currentMessage.image){
                if(this.debug)console.log("checking attachments");
                if (message.attachments.size > 0) {
                    if(this.debug)console.log("checking pic");
                    if (message.attachments.every(this.attachIsImage)){
                        
                    }
                    else{
                        if(this.debug)console.log("failed test");
                        continue;
                    }
                }
                else{
                    continue;
                }
            }

            //check if the user is listed as allowed to respond to, an empty allowed list means that the message could have been sent by anyone
            for(let j=0; j< users.length;++j){
                if(users[j]==message.member.user.id){
                    allowed=true;
                    break;
                }
            }
            if(users.length!=0 && !allowed){
                if(this.debug)console.log("failed allowed"+currentMessage.response);
                continue;
            }
            //checks to see if the message has to be case-sensitive, or if it only needs to contain certain words
            if(currentMessage.contains.length==0){
                if(currentMessage.message!==""){
                    if(currentMessage.case_sensitive && currentMessage.message!=message.content){
                        if(this.debug)console.log("failed check 1");
                        continue;
                    }
                    else if(!currentMessage.case_sensitive && message.content.toLowerCase()!=currentMessage.message.toLowerCase()){
                        if(this.debug)console.log("failed check 2"+currentMessage.message);
                        continue;
                    }
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
                    if(this.debug)console.log("failed contains"+currentMessage.response);
                    continue;
                }
            }
            const value = this.random.integer(0,currentMessage.response.length-1);
            if(this.debug)console.log(value);
            if(messages[i].reply){
                message.reply(currentMessage.response[value]);
            }
            else{
                message.channel.send(currentMessage.response[value]);
            }
            if(currentMessage.react.length>0){
                const idx = this.random.integer(0,currentMessage.react.length-1);
                message.react(currentMessage.react[idx]);
            }
            break;
        }
    }
};