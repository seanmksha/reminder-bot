
const moment = require("moment-timezone");
const MongoClient = require('mongodb').MongoClient;
module.exports= class TimeMessages{
    constructor(client,mongoURL){
        this.url=mongoURL;
        this.client=client;
    }
    processChat(message){
        var client = this.client;
        var lowercase = message.content.toLowerCase();
        if(lowercase.includes("what")&& lowercase.includes("time")&&
        lowercase.includes("is")&& lowercase.includes("it")){
            message.channel.send(moment().tz("America/Los_Angeles").format("h:mm  A")+" PDT");
            message.channel.send(moment().tz("America/New_York").format("h:mm  A")+" EST");
        }
        let user = message.mentions.users.first();
        if(message.isMentioned(client.user)&& lowercase.includes("remind")&&lowercase.includes("me")){
            this.setupReminder(message);
        }
    }
    pollTimestamp(backupURL){
        var client = this.client;
        var url = this.url;
        if(url==null){
            this.url=backupURL;
            url=backupURL;
            console.log(url);
        }
        MongoClient.connect(url,(err,db)=>{
            if(err){
                throw err;
            }
            var dbo = db.db("reminders");
            dbo.collection("reminders").find({}).forEach((err,doc)=>{
                if (err) throw err;
                if(doc==null)return;
                console.log(doc);
                var currentTime = moment().valueOf();
                console.log(currentTime);
                var timestamp = doc.time;
                var record = doc;
                    
                    if(timestamp<=currentTime){
                        console.log("hit time, time to remind");
                        client.users.get(record.userId).send("Reminder: <@"+record.userId+"> : You have to "+record.description);
                        dbo.collection("reminders").deleteOne({_id:record._id},(err,obj)=>{
                            if(err)throw err;
                            console.log("1 document deleted");
                            db.close();
                        });
                        
                    }
                    else{
                        db.close();
                    }
                }
           
        );
     });
    }
    
    setupReminder(lowercase){
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
        let found = false;
        var event = "";
        for(let i=0; i<res.length;++i){
            
            if(res[i].includes("in")){
                found=false;
            }
            if(found){
                event= event+ res[i] + " ";
            }
            if(res[i].includes("to")){
                found=true;
            }

        }
        event=event.split("my").join("your");
        event=event.trim();
        message.channel.send("Set reminder to \"" +event+"\" for "+ hour+" hours,  "+minute+" minutes, and "+second+" seconds from now.");
        this.insertReminder(hour,minute,second,event);
    }
    
    insertReminder(hour, minute, second, event){
        var client = this.client;
        var url = this.url;
        MongoClient.connect(url,(err,db)=>{
            if(err){
                throw err;
            }
            var dbo = db.db("reminders");
            var myobj = {
                description: event,
                time: moment().add(hour,'hours').add(minute,'minutes').add(second,'seconds').valueOf(),
                userId: message.member.user.id
            };
            dbo.collection("reminders").insertOne(myobj,(err,res)=>{
                if (err)throw err;
                console.log("successfully added reminder");
                db.close();
            });
        });
    }
    
    
}