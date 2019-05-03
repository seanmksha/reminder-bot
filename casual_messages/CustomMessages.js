const Handler = require("../handler.js");
module.exports= class CustomMessages extends Handler{
    constructor(client,directory){
        super(client);
        const {Random} = require("random-js");
        this.client=client;
        this.fs = require("fs");
        this.directory=directory;
        this.content = this.fs.readFileSync(directory);
        this.jsonContent = JSON.parse(this.content);
        this.random = new Random();
    }
    reloadContent(){
        this.content = this.fs.readFileSync(this.directory);
        this.jsonContent = JSON.parse(this.content);
        console.log("Commands Reloaded");
    }

    processChat(message){
        var messages = this.jsonContent.messages;
        var client = this.client;
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
            if(users.length!=0 && !allowed){
                continue;
            }
            //checks to see if the message has to be case-sensitive, or if it only needs to contain certain words
            if(currentMessage.contains.length==0){
                if(currentMessage.case_sensitive && currentMessage.message!=message.content){
                    continue;
                }
                else if(!currentMessage.case_sensitive && message.content.toLowerCase()!=currentMessage.message.toLowerCase()){
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
            const value = this.random.integer(0,currentMessage.response.length-1);
            if(messages[i].reply){
                message.reply(currentMessage.response[value]);
            }
            else{
                message.channel.send(currentMessage.response[value]);
            }
            break;
        }
    }
};