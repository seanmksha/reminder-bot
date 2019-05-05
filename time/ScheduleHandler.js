const Handler = require("../handler.js");
module.exports = class Schedule extends Handler{
    constructor(client,dbo){
        super(client);
        this.dbo=dbo;
    }
    processChat(message){
        var client = this.client;
        var lowercase = message.content.toLowerCase();
        if(lowercase.startsWith("!schedule")){
            var tokens = lowercase.split(" ");
            var original = message.content.split(" ");
            var day = tokens[1];
            if(day=="reset"){
                this.resetSchedule(message);
                return;
            }
            else if(day=="help"){
                message.channel.send("Syntax for adding a person to the schedule: !schedule [day] [description] \nExample: !schedule Monday Sean\nSyntax for viewing a day's schedule: !schedule [Day]\nExample: !schedule monday\nSyntax for deleting a record: !schedule remove [id]\nExample:!schedule remove 1\nTo reset your schedule type !schedule reset");
                return;
            }
            else if(day=="remove"&&tokens.length==3){
                if(isNaN(tokens[2])){
                    message.channel.send("Schedule: Error - "+tokens[2]+ " is not a number.");
                }
                removeSchedule(message,parseInt(tokens[2]));
            }
            if(tokens.length==2){
                //get schedule
                this.getSchedule(message,day);
            }
            else{
                var description = "";
                for(let i=2;i<tokens.length;++i){
                    description=description+original[i]+" ";
                }
                description=description.trim();
                this.setSchedule(message,day,description);
            }
        }
    }
    getSchedule(message,dayToken){
        message.channel.send(this.getUserName(message)+"\'s "+this.capitalizeFirstLetter(dayToken)+" Schedule:");
        this.dbo.collection("schedule").find({$and:[{day:dayToken},{userId:message.member.user.id}]}).each(
            (err,doc)=>{
            if(doc==null)return;
            if(err)throw err;
            //doc._id+
            message.channel.send(doc.description);
        }
    );
    }
    removeSchedule(message, id){
        var query = {
            _id:id
        };
        this.dbo.collection("schedule").delete(query,(err,res)=>{
            if(err)throw err;
            message.channel.send("Successfully deleted record "+id);
        });
    }
    setSchedule(message,dayToken,desc){
        var query = {
            day:dayToken,
            userId:message.member.user.id,
            description:desc
        };
        this.dbo.collection("schedule").insertOne(query,(err,res)=>{
            if(err)throw err;
            console.log("Successfully added schedule"+res);
            message.channel.send("Schedule: Added "+desc+" to "+this.capitalizeFirstLetter(dayToken)+" for "+this.getUserName(message)+"\'s schedule");
        });
    }
    resetSchedule(message){
        var query = {
            userId:message.member.user.id
        };
        this.dbo.collection("schedule").deleteMany(query,
            (err,obj)=>{
                if(err)throw err;
                console.log("Successfully reset schedule");
                message.channel.send("Schedule: Reset schedule for "+this.getUserName(message));
            });
    }
    capitalizeFirstLetter(str){
        return str.charAt(0).toUpperCase()+str.slice(1);
    }
    getUserName(message){
        var user = message.member;
        user = user.toString();
        if (user.includes("!")) {
            user = user.split("!")[1].split(">")[0];
        } else {
            user = user.split("@")[1].split(">")[0];
        }
        return this.client.users.get(user).username;
    }
}