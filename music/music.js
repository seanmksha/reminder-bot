var queue = [];
var playing = false;
var self = module.exports=
{
    chat:function (message,client){
        if(message.author.id==client.user.id || message.member==null){
            return;
        }
        var lowercase = message.content.toLowerCase();
        if(message.isMentioned(client.user) && lowercase.includes("join")){
            const channel = message.author.channel;
            if (!channel) return console.error("The channel does not exist!");
             channel.join().then(connection => {
                // Yay, it worked!
                message.channel.send("Joined "+channel);
            }).catch(e => {
    // Oh no, it errored! Let's log it to console :)
            console.error(e);
            });
        }
        else if(lowercase.includes("!play")){
            var args= lowercase.split(" ");
        }
       
    }
}