
const moment = require("moment-timezone");
const moment2 = require("moment-holiday");
const Handler = require("../handler.js");
const MongoClient = require('mongodb').MongoClient;
const EST = "America/New_York";
const DEFAULT_TIME = ""
const dayMap = new Map([
    ["monday",1],
    ["tuesday",2],
["wednesday",3],
["thursday",4],
["friday",5],
["saturday",6],
["sunday",7]
]);
module.exports= class TimeHandler extends Handler{
    constructor(client,dbo){
        super(client);
        this.dbo=dbo;
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
        else if(message.isMentioned(client.user)&& lowercase.includes("!remind")){
            this.setupDayReminder(message,lowercase);
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
            //if(testHoliday.charAt(testHoliday.length()-1)=="?"){
              //  testHoliday=testHoliday.slice(0,-1);
            //}
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
      
        var client = this.client;
        this.dbo.collection("reminders").find().each((err,doc)=>{
                if(err)throw err;
                if(doc==null)return;
                
                var currentTime = moment().valueOf();
                
                var timestamp = doc.time;
                var record = doc;
                    
                    if(timestamp<=currentTime){
                        console.log("hit time, time to remind");
                        var user = client.users.get(record.userId);
                        if(user!=null){
                            user.send("Reminder: <@"+record.userId+"> : You have to "+record.description);
                        }
                        this.dbo.collection("reminders").deleteOne({_id:record._id},(err,obj)=>{
                            if(err)throw err;
                            console.log("1 document deleted");
                            
                        });
                        
                    }
                    
                }
           
        );
    }
    getMomentNextDay(day){
        const today = moment().tz(EST).isoWeekday();

        // if we haven't yet passed the day of the week that I need:
        if (today <= day) { 
            // then just give me this week's instance of that day
            return moment().tz(EST).isoWeekday(day);
        } else {
            // otherwise, give me *next week's* instance of that s
            
            return moment().tz(EST).add(1, 'weeks').isoWeekday(day);
        }
    }
    setupDayReminder(message, lowercase){
        var res = lowercase.split(" ");
        var original = message.content.split(" ");
        var day = res[2];
        if(day=="help"){
            message.channel.send("Syntax for reminders given a next day: !remind [day] [description]\nFor example:!remind monday Sean has to type code\nFor relative reminders use:@ remind me [day] to [description]");
           return;
        }
        var description = "";
        for(let i=3; i<res.length;++i){
            description= description+ original[i]+" ";
        }
        description=description.trim();
        this.insertDayReminder(message,lowercase,day,description);
    }
    setupReminder(message,lowercase){
        var res = lowercase.split(" ");
        //check for holiday
        var isHolidayReminder = false;
        var containsBefore = false;
        var containsDayBefore = false;
        var holidayName="";
        /*  var hol = moment().holiday(testHoliday);
            if(hol!=false){
                var now = moment();
                message.channel.send(hol.isHoliday()+" is on "+hol.format("MMMM Do YYYY")+" or in "+ (hol.diff(now, 'days')+1)+" days."); 
            }
            return true;
        */
       var holiday;
        for(let i=0; i<res.length;++i){
            var word = res[i];
            var hol = moment().holiday(word);
            if(hol!==false && word!=="day"){
                console.log(hol);
                holidayName=hol.isHoliday();
                isHolidayReminder=true;
                holiday=hol;
            }
            if(word=="before"){
                containsBefore=true;
            }
            if(word=="day"){
                containsDayBefore=true;
            }
        }
        if(!isHolidayReminder)
        {
           this.setupRelativeReminder(message,res,lowercase);
        }
        else{
            this.setupHolidayReminder(message,res,lowercase,containsBefore,holiday,holidayName);
        }
    }
    setupHolidayReminder(message,res,lowercase,containsBefore,holiday, holidayName){
        let found = false;
        var event = "";
        holiday.subtract("5","hours");
        for(let i=0; i<res.length;++i){
            if(res[i].includes("on")||res[i].includes("in")){
                found=false;
            }
            if(found){
                if(res[i]=="i"||res[i]=="I"){
                    event=event+"You"+" ";
                }
                else{
                    event= event+ res[i] + " ";
                }
            }
            if(res[i].includes("to")||res[i].includes("that")){
                found=true;
            }
        }
        event=event.split("my").join("your");
        event=event.split("My").join("Your");
        
        event=event.trim();
        /* message.channel.send(moment().tz("America/Los_Angeles").format("h:mm  A")+" PDT");
            message.channel.send(moment().tz("America/New_York").format("h:mm  A")+" EST");
           */
       
        this.insertHolidayReminder(message,holiday,event);
    }
    setupRelativeReminder(message,res,lowercase){
        let hour = 0;
        let original = message.content.split(" ");
        for(let i=0; i<res.length;++i){
            if(res[i].includes("hour")||res[i].includes("hr")||res[i].includes("hrs")){
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
        if(res[i].includes("minute")||res[i].includes("min")){
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
        if(res[i].includes("second")||res[i].includes("sec")){
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
            event= event+ original[i] + " ";
        }
        if(res[i].includes("to")||res[i].includes("that")){
            found=true;
        }

    }


    event=event.split("my").join("your");
    event=event.trim();
    message.channel.send("Set reminder to \"" +event+"\" for "+ hour+" hours,  "+minute+" minutes, and "+second+" seconds from now.");
    this.insertReminder(message,hour,minute,second,event);
    }
    insertDayReminder(message,lowercase, day,event){
        var dayNumb = dayMap.get(day);
        if(dayNumb==null)return;
        var mom = this.getMomentNextDay(dayNumb).startOf('day').add(20,'hours');
     
        var obj = {
            description: event,
            time: mom.valueOf(),
            userId:message.member.user.Id
        }
        this.dbo.collection("reminders").insertOne(obj,(err,res)=>{
            if(err)throw err;
            message.channel.send("Set reminder to \"" +event+"\" at "+mom.tz("America/Los_Angeles").format("MMMM Do YYYY, h:mm:ss a")+" PDT / "+
            mom.tz("America/New_York").format("MMMM Do YYYY, h:mm:ss a")+" EST");
        });
    }
    insertHolidayReminder(message, momentObj,event){
        var client = this.client;
        var url = this.url;
        var myobj = {
                description: event,
                time: momentObj.valueOf(),
                userId: message.member.user.id
            };
        this.dbo.collection("reminders").insertOne(myobj,(err,res)=>{
            if (err)throw err;
            console.log("successfully added reminder");
            message.channel.send("Set reminder to \"" +event+"\" at "+mom.tz("America/Los_Angeles").format("MMMM Do YYYY, h:mm:ss a")+" PDT / "+
            mom.tz("America/New_York").format("MMMM Do YYYY, h:mm:ss a")+" EST, the day before "+holidayName+".");
        });
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