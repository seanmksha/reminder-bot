
const moment = require("moment-timezone");
const moment2 = require("moment-holiday");
const Handler = require("../handler.js");
const MongoClient = require('mongodb').MongoClient;
module.exports= class TimeMessages extends Handler{
    constructor(client,mongoURL){
        super(client);
        this.url=mongoURL;
        MongoClient.connect(this.url,(err,db)=>{
            if(err){
                throw err;
            }
            
            this.dbo = db.db("reminders");
            setInterval(()=>
                this.pollTimestamp()
            ,1000,this.url);
        });
    }
    processChat(message){
        var client = this.client;
        var lowercase = message.content.toLowerCase();
        if(lowercase.includes("what")&& lowercase.includes("time")&&
        lowercase.includes("is")&& lowercase.includes("it")){
            message.channel.send(moment().tz("America/Los_Angeles").format("h:mm  A")+" PDT");
            message.channel.send(moment().tz("America/New_York").format("h:mm  A")+" EST");
            return;
        }
        let user = message.mentions.users.first();
        if(message.isMentioned(client.user)&& lowercase.includes("remind")&&lowercase.includes("me")){
            this.setupReminder(message,lowercase);
            return;
        }
        if(message.isMentioned(client.user)&& lowercase.includes("next") && lowercase.includes("holiday")){
            var hol = moment().nextHoliday(1,false);
            var now = moment();
            message.channel.send(hol.isHoliday()+" on "+hol.format("MMMM Do YYYY")+" or in "+ (hol.diff(now, 'days')+1)+" days.");
            return;
        }
        if(lowercase.includes("when is")){
           if(this.findHoliday(lowercase,message)){
               return;
           }
        }
        
    }
    findHoliday(lowercase,message){
        var res = lowercase.split(" ");
        var foundWhen = false;
        var foundBoth = false;
        var pos = 0;
        for(let i=0; i<res.length;++i){
            if(foundWhen && res[i]=="is"){
                pos=i+1;
                foundBoth=true;
                break;
            }
            if(res[i]=="when"){
                foundWhen=true;
            }
            else{
                foundWhen=false;
            }
        }
        if(foundBoth&& pos <res.length){
            var testHoliday = res[pos];
            if(testHoliday.charAt(testHoliday.length()-1)=="?"){
                testHoliday=testHoliday.slice(0,-1);
            }
            var hol = moment().holiday(testHoliday);
            if(hol!=false){
                var now = moment();
                message.channel.send(hol.isHoliday()+" is on "+hol.format("MMMM Do YYYY")+" or in "+ (hol.diff(now, 'days')+1)+" days."); 
            }
            return true;
        }
        return false;
    }
   
    pollTimestamp(backupURL){
        if(this.dbo==null){
            
            MongoClient.connect(backupURL,(err,db)=>{
                if(err){
                    throw err;
                }
                
                this.dbo = db.db("reminders");
            });
            return;
        }
        var client = this.client;
        this.dbo.collection("reminders").find().each((err,doc)=>{
        
                if(doc==null)return;
                
                var currentTime = moment().valueOf();
                
                var timestamp = doc.time;
                var record = doc;
                    
                    if(timestamp<=currentTime){
                        console.log("hit time, time to remind");
                        client.users.get(record.userId).send("Reminder: <@"+record.userId+"> : You have to "+record.description);
                        this.dbo.collection("reminders").deleteOne({_id:record._id},(err,obj)=>{
                            if(err)throw err;
                            console.log("1 document deleted");
                            
                        });
                        
                    }
                    
                }
           
        );
    }
    
    setupReminder(message,lowercase){
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
        this.insertReminder(message,hour,minute,second,event);
    }
    
    insertReminder(message,hour, minute, second, event){
        var client = this.client;
        var url = this.url;
        var myobj = {
                description: event,
                time: moment().add(hour,'hours').add(minute,'minutes').add(second,'seconds').valueOf(),
                userId: message.member.user.id
            };
        this.dbo.collection("reminders").insertOne(myobj,(err,res)=>{
            if (err)throw err;
            console.log("successfully added reminder");
        });
    }
    
    
}