const Discord = require('discord.js');
const auth = require('./auth.json');
const fs = require('fs');

var gameStarted = false;
var gameBegun = false;
var playerIn = [];
var night_time = false;
var doctor_channel = null;
var angel_channel = null;
var werewolves_channels = [];
var night_targets = []
var doctor_targets = []
var angel_targets = []

var werewolves_done = false;
var doctor_done = false;
var angel_done = false;

//var timer_message = null;
//5 minutes
//var max_night_timer = 300000;
//var current_night_timer = 0;

// Initialize Discord Bot
var bot = new Discord.Client();

bot.login(auth.token)

bot.once('ready', function (evt) {
    console.log('Connected');
});

bot.once('reconnecting', () => {
    console.log('Reconnecting!');
});

bot.once('disconnect', () => {
    console.log('Disconnect!');
});

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function checkPrefix(content, prefix=null){
    if(prefix === null){
        if(content.substring(0,3) === auth.prefix){
            return true;
        } else {
            return false;
        }
    } else {
        if(content.substring(0,prefix.length) === prefix){
            return true;
        } else {
            return false;
        }
    }
}

function checkAdmin(id, message){    

    for(var i = 0; i < playerIn.length; i++){
        if(playerIn[i].id === id && playerIn[i].admin){
            return true;
        }
    }

    message.channel.send("Jekk ridt tmexxi missek bdejta int basla")

    return false
}

/*
function UpdateTimer(message){
    current_night_timer -= 1000;

    var min = Math.floor((current_night_timer/1000/60) << 0)
    var sec = Math.floor((current_night_timer/1000) % 60);
    if(timer_message === null){
        timer_message = await message.channel.send("Il-lejl fadalu " + min + ":" + sec + "")
    }else{
        timer_message.edit("Il-lejl fadalu " + min + ":" + sec + "")
    }
}
*/

//TODO build
function checkVictory(){}

function StartGame(){
    var werewolves;
    var doctor;
    var angel;

    var temp_players = shuffle(playerIn)

    //TODO remove when done
    temp_players.push({
        id: "",
        admin: false,
        user: {
            username: "Test1"
        }
    })

    if(temp_players.length < 7){
        //TODO remove when done
        werewolves = 2;//2
        doctor = 0;//1
        angel = 0;
    }else if(temp_players.length === 7){
        werewolves = 2;
        doctor = 1;
        angel = 1;
    }else if(temp_players.length >= 8){
        werewolves = Math.round(temp_players.length/3)
        doctor = 1;
        angel = 1; 
    }

    var total_werewolves = werewolves;

    for(var i = 0; i < temp_players.length; i++){

        if(werewolves > 0){
            temp_players[i].type = "Werewolf"
            //TODO remove
            if(temp_players[i].user.tag){
                temp_players[i].user.createDM()
                    .then((channel) => {
                        channel.send("Hemm ahna Werewolf, *woof woof*.\n La jigi il-lejl, l-ewwel haga li ha tinnota hi li ser ikun id dlam u jikbirlek daqxejn suf. Sorry in advance. Iddiskuti hawn u ivvota lil min trid toqtol.")

                        werewolves_channels.push({
                            user: channel.recipient,
                            channel: channel
                        })

                        if(werewolves_channels.length === total_werewolves){
                            var ww_list = "Kemm tkun taf, dawn huma shabek kollhom suf: \n\n";
                            for(var i = 0; i < werewolves_channels.length; i++){
                                ww_list += "\t\t - "+werewolves_channels[i].user.username + "\n";
                            }

                            ww_list += "\nMeta tikteb hawn bil-lejl, dawn ser jircievu l-messagi. Tinfaqax toffendijhom mieghi ghax nghidilhom bazikament."

                            for(var i = 0; i < werewolves_channels.length; i++){
                                //TODO remove later
                                if(werewolves_channels[i].channel){
                                    werewolves_channels[i].channel.send(ww_list)  
                                }     
                            }
                            
                        }
                    })
                    .catch(error => {
                        console.log(error)
                    })
            }
            werewolves--;
        } else if(doctor > 0){
            temp_players[i].type = "Doctor"
            //TODO remove
            if(temp_players[i].user.tag){
                temp_players[i].user.createDM()
                    .then((channel) => {
                        channel.send("Worrajt Dottore, f'idejk Doctor.\nLa jigi l-lejl,f hawn trid tikteb lil min trid izzur.")

                        doctor_channel = channel
                    })
                    .catch(error => {
                        console.log(error)
                    })
            }
            doctor--;
        }else if(angel > 0){
            temp_players[i].type = "Angel"
            //TODO remove
            if(temp_players[i].user.tag){
                temp_players[i].user.createDM()
                    .then((channel) => {
                        channel.send("Charlie's Angel's kont gej qal madunni, pero Angel int.\nLa jigi l-lejl, ghazel lil min trid isalva hawn.")

                        angel_channel = channel
                    })
                    .catch(error => {
                        console.log(error)
                    })
            }
            angel--;
        }else{
            temp_players[i].type = "Civilian"
            //TODO remove
            if(temp_players[i].user.tag){
                temp_players[i].user.createDM()
                    .then((channel) => {
                        channel.send("Inti ha tkun pleb Civilian f'din, kula zibel")
                    })
                    .catch(error => {
                        console.log(error)
                    })
            }
        }
    }


 
    gameBegun = true;

    playerIn = shuffle(temp_players)
}

function StartNight(){
    //current_night_timer = max_night_timer;

    night_time = true;

    werewolves_done = false;

    if(doctor_channel !== null){
        doctor_done = false;
    }else{
        doctor_done = true;
    }

    if(angel_channel !== null){
        angel_done = false;
    }else{
        angel_done = true;
    }

    night_targets = []
    doctor_targets = []
    angel_targets = []

    var werewolf_opening_line = "Beda il-lejl bro, tkellem ma shabek hawn u ivvota x'hin trid billi taghmel 'ww.kill *number*'. Dawn huma iz-zibel li fadal:\n\n"
    var doctor_opening_line = "Beda il-lejl u ghandek cans taghmel house visit dott. Ghidli lil min billi tikteb 'ww.visit *number*'. Dawn huma iz-zibel li fadal:\n\n"
    var angel_opening_line = "Beda il-lejl u tista isalva xi basla. Tkunx kaward u salva lil xi haddiehor. Ghidli lil min billi tikteb 'ww.save *number*'. Dawn huma iz-zibel li fadal:\n\n"

    for(var i = 0; i < playerIn.length; i++){
        if(playerIn[i].type !== "Werewolf"){
            night_targets.push(playerIn[i])   
            night_targets[night_targets.length-1].votes = 0; 
            //TODO remove
            if(playerIn[i].user.username)
                werewolf_opening_line += " - "+ (night_targets.length-1).toString() +". "+playerIn[i].user.username + "\n"

        }
    }

    for(var i = 0; i < werewolves_channels.length; i++){
        werewolves_channels[i].channel.send(werewolf_opening_line) 
        //bot.on('message')
    }

    for(var i = 0; i < playerIn.length; i++){
        //TODO remove
        if(playerIn[i].user.username)
            angel_opening_line += i +". "+playerIn[i].user.username

        angel_targets.push(playerIn[i])
        if(playerIn[i].type !== "Doctor"){
            //TODO remove
            if(playerIn[i].user.username)
                doctor_opening_line += i +". "+playerIn[i].user.username

            doctor_targets.push(playerIn[i])
        }
    }

    if(angel_channel !== null){
        angel_channel.send(angel_opening_line)
    }

    if(doctor_channel !== null){
        doctor_channel.send(doctor_opening_line)
    }

    /*setInterval(() => {
        UpdateTimer(message)
    }, 1000)*/

}

async function YesNoListen(message){
    if(message.author.bot) return

    if(message.content === "Y"){
        if(checkAdmin(message.member.id, message)){
            message.channel.send("GHAL QATLA");
            bot.removeListener('message',YesNoListen)
            StartNight()
        }
    }else if(message.content === "N"){
        if(checkAdmin(message.member.id, message)){
            //TODO start discussion
            message.channel.send("Iddiskutejna LIBA");
            bot.removeListener('message',YesNoListen)
        }
    }else {
        if(!checkPrefix(message.content.toLowerCase())){
            message.channel.send("Ijja wiegeb 'Y' jew 'N' Banana!")
        }
    }
}

bot.on('message', async message => {
    if(message.author.bot) return
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`

    //TODO remove in the end
    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}test`)) {
        message.channel.send("Dan test duda!")
        return;
    }

    //TODO remove in the end
    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}die`)) {
        message.channel.send("Caw Zejz!")
        bot.destroy()
        return;
    }

    //Admin Commands --------------------------------------------------------------------------------

    if (checkPrefix(message.content.toLowerCase(), `${auth.prefix}start`)){
        if(message.channel.type !== "dm"){
            if(!gameStarted){
                message.channel.send("Ajma zaqqi, f'idejn <@"+ message.member.user.id +"> din. Min irid jista jithol!")
                playerIn.push({
                    id: message.member.user.id,
                    admin: true,
                    user: message.member.user
                })
                gameStarted = true;
            }else{
                message.channel.send("Ga hemm wahda ghaddej pajs, mitluf ta")
            }
        }else{
            message.channel.send("Ma tistax tibda loghba Werewolf hawn bro")
        }
        return;
    }

    if (checkPrefix(message.content.toLowerCase(), `${auth.prefix}in`)){
        if(message.channel.type !== "dm"){
            if(gameStarted){
                if(!gameBegun){
                    var found = false;
            
                    for(var i = 0; i < playerIn.length; i++){
                        if(playerIn[i].id === message.member.user.id){
                            found = true;
                            break;
                        }
                    }
            
                    if(!found){
            
                        var choice = getRandomInt(4);
                        switch(choice){
                            case 0: 
                                message.channel.send("Noted with thanks <@"+ message.member.user.id+">")
                                break;
                            case 1: 
                                message.channel.send("Il-liba diga bdejt iddejjaqni <@"+ message.member.user.id+">")
                                break;
                            case 2:
                                message.channel.send("\*laughing\*. Stenn actually vera ha tilghab <@"+ message.member.user.id +"> \*laughing intensifies\*")
                                break;
                            case 3:
                                message.channel.send("Welcome borza hara, awww <@"+ message.member.user.id +">")
                                break;
                            default:
                                break;
                        }
            
                        playerIn.push({
                            id: message.member.user.id,
                            admin: false,
                            user: message.member.user
                        })
            
                        var output = "Nies s'issa: \n";
                        for(var i = 0; i < playerIn.length; i++){
                            if(playerIn[i].admin){
                                output += "\t\t - <@"+playerIn[i].id+"> - il-boss \n";
                            }else{
                                output += "\t\t - <@"+playerIn[i].id+"> \n";
                            }
                        }
        
                        message.channel.send(output)
            
                    }else{
                        var choice = getRandomInt(6);
                        switch(choice){
                            case 0: 
                                message.channel.send("Ijwa ijwa fhimtek <@"+ message.member.user.id+">")
                                break;
                            case 1: 
                                message.channel.send("Ok")
                                break;
                            case 2:
                                message.channel.send("Warlight <@"+ message.member.user.id+">")
                                break;
                            case 3:
                                message.channel.send("Jekk tibatli ohra <@"+ message.member.user.id +"> personalment nigi naqlalek il gerzuma")
                                break;
                            case 4:
                                message.channel.send("<@"+message.member.user.id +"> jekk tghidli ohra ha ncempel il pulizija")
                                break;
                            case 5:
                                message.channel.send("Ooooof, needy much <@"+ message.member.user.id+">")
                                break;
                            default:
                                break;
                        }
                    }
                }else{
                    message.channel.send("Ga bdiet il-loghba barri. Issa stenna u ghaggel darb' ohra")
                }
            }else{
                message.channel.send("Ma hemmx loghba ghaddej, Aqbad u ibda wahda int jekk ghandek il-Cookies")
            }
        }else{
            message.channel.send("Jekk ha tithol f'loghba, ithol b'mod pubbliku king")
        }
        return    
    }

    if (checkPrefix(message.content.toLowerCase(), `${auth.prefix}list`)){
        if(gameStarted){
            var output = "Nies s'issa: \n";
            for(var i = 0; i < playerIn.length; i++){
                if(playerIn[i].admin){
                    output += "\t\t - <@"+playerIn[i].id+"> - il-boss \n";
                }else{
                    output += "\t\t - <@"+playerIn[i].id+"> \n";
                }
            }
            message.channel.send(output)
        }else{
            message.channel.send("X'lista hij? Mela qed tiblaghom?!")
        }
        return
    }

    if (checkPrefix(message.content.toLowerCase(), `${auth.prefix}stop`)){
        if(message.channel.type !== "dm"){
            if(gameStarted){
                if(checkAdmin(message.member.user.id, message)){
                    //Reset game variables
                    gameStarted = false;
                    gameBegun = false;
                    playerIn = []
                    werewolves_channels = [];
                    doctor_channel = null;
                    angel_channel = null;
                    night_time = false;
                    night_targets = [];
                    doctor_targets = [];
                    angel_targets = [];
                    //current_night_timer = 0;
                    message.channel.send("Piff x'int spoil sport <@" + message.member.user.id + "> imma ok")
                }
            }else{
                message.channel.send("Ma hemmx loghob xi twaqqaf troglodit")
            }
        }else{
            message.channel.send("Jekk ha twaqqaf l-loghba, nahseb ahjar tghid lil kulhadd lele?")
        }
        return;
    }

    if (checkPrefix(message.content.toLowerCase(), `${auth.prefix}begin`)){
        if(message.channel.type !== "dm"){
            if(gameStarted){
                if(!gameBegun){
                    if(checkAdmin(message.member.user.id, message)){
                        //TODO fix to 5 later
                        if(playerIn.length >= 1){
                            StartGame()
                            
                            message.channel.send("Il-loghba lesta, ha tibda b'lejl jew le? (Y/N).")

                            bot.on('message', YesNoListen)
                        }else{          
                            message.channel.send("Irid ikun hemm alinqas 5 min nies. Tghallem ghodd.")
                        }
                    }
                }else{
                    message.channel.send("Taf kemm ilna li bdejna dahna?")
                }
            }else{
                message.channel.send("Irid ikun hemm loghba l-ewwel biex tibdija bocc")
            }
        }else{
            message.channel.send("Jekk tixtieq tibda l-loghba, iktar fil-general chat")
        }
        return
    }

    //Misc Commands --------------------------------------------------------------------------------

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}help`)) {
        message.channel.send(
            "Jekk int Cole ma nixtieq nispjega imma fuck it: \n\n" +
            "\t\t- Jekk trid tibda Werewolf, ikteb 'ww.start', pero ha tkun responsabli taghha king. \n" +
            "\t\t- Jekk tixtieq tithol fil-loghba, ikteb 'ww.in'. Tipruvahiex jekk ghad ma hemmx loghba pacc. \n" +
            "\t\t- Jekk tixtieq tara min ha jilghab, u tiggudika, ikteb 'ww.list'. Ha jiehdu ghalihom pero. \n" +
            "\t\t- Jekk int responsabli tal-loghba, tista twaqqaf il-loghba b''ww.stop', pero kulhadd ha jobodok probabilment. \n" +
            "\t\t- Jekk int responsabli tal-loghba u dahlu alinqas 5 min-nies, mela tista tibda il-loghba billi taghmel 'ww.begin'. \n\n" +
            "\t\t- Fil-bidu ser insaqsik jekk trid tibda b'lejl jew gurnata. Min hu l-leader (?!) jista' jikteb Y jew N skond x'irid. \n\n" +
            "Ghajnuna ghal min hu werewolf (SHHHHH):. \n" +
            "\t\t- Fil-bidu tal-loghba ser tinfetahlek chat mieghi (il-bot). Hemm tista titkellem ma shabek il-Werewolfs u tivvota lil min trid toqtol. Voti tal-werewolf iridu jkunu unanimi, igiefiri fuckin fthemu.\n" +
            "\t\t- Biex tivvota ghal qtil, iccekja liema numru ghandu l-imsejken li dejqek, (il-lista tidher mal bidu tal-lejl, u kull darba li xi hadd min shabek jivvota) u ikteb ww.kill *numru*.\n" +
            "K'ma jahdiemx xi haga, wahlu f'Gingru.")
        return ;
    }

    //Doctor Night Commands ------------------------------------------------------------------------

    if (checkPrefix(message.content.toLowerCase(), `${auth.prefix}visit`)){
        //TODO this shizzle
        if(gameStarted && gameBegun){
            if(message.channel.type !== "dm"){
                message.channel.send("Shhh mhux hawn....")
            }else{
                if(night_time && !doctor_done){
                }
            }
        }
    }

    //Angel Night Commands -------------------------------------------------------------------------

    if (checkPrefix(message.content.toLowerCase(), `${auth.prefix}save`)){
        //TODO this shizzle
        if(gameStarted && gameBegun){
            if(message.channel.type !== "dm"){
                message.channel.send("Shhh mhux hawn....")
            }else{
                if(night_time && !angel_done){
                }
            }
        }
    }

    //Werewolf Night Commands ----------------------------------------------------------------------

    if (checkPrefix(message.content.toLowerCase(), `${auth.prefix}kill`)){
        if(gameStarted && gameBegun){
            if(message.channel.type !== "dm"){
                message.channel.send("Shhh mhux hawn....")
            }else{
                if(night_time && !werewolves_done){
                    var me = 0;                
                    var found = false;
                    var comrades = [];
                    for(var i = 0; i < werewolves_channels.length; i++){
                        if(werewolves_channels[i].user.id === message.author.id){
                            me = i;
                            found = true;
                        }else{
                            comrades.push(werewolves_channels[i].channel)
                        }            
                    }
    
                    if(found){
                        var number = message.content.substring(message.content.indexOf(" ")+1, message.content.length)
                        number = parseInt(number)
                        if(number !== NaN){
                            if(number < night_targets.length){
                                night_targets[number].votes++;
                                
                                var night_target_list = "Voti s'issa:\n\n"
                                var total_votes = 0;
                                var split = 0;

                                for(var i = 0; i < night_targets.length;i++){
                                    night_target_list += " - " +  i + ". "+ night_targets[i].user.username + " - Voti: " + night_targets[i].votes + "\n"
                                    total_votes += night_targets[i].votes
                                    if(night_targets[i].votes !== 0){
                                        if(split === 0){
                                            split = 1;
                                        }else{
                                            split = 2;
                                        }
                                    }
                                }

                                for(var i = 0; i < comrades.length; i++){
                                    comrades[i].send(" - " + message.author.username + " ivvota lil "  + night_targets[number].user.username)
                                    comrades[i].send(night_target_list)
                                }
                                werewolves_channels[me].channel.send(night_target_list)

                                if(total_votes === werewolves_channels.length){
                                    if(split === 2){
                                        for(var i = 0; i < werewolves_channels.length; i++){
                                            werewolves_channels[i].channel.send("Guys, fuckin ghazlu persuna wahda ghax ha taqbez l-ostja, ergaw ivvutaw kollha")
                                        }
                                        
                                        for(var i = 0; i < night_targets.length;i++){
                                            night_targets[i].votes = 0;
                                        }
                                    }else{
                                        for(var i = 0; i < werewolves_channels.length; i++){
                                            werewolves_channels[i].channel.send("Lel povru "+ night_targets[number].user.username + ", ghaddiet.")
                                        }
                                        werewolves_done = true;
                                    }
                                }

                            }else{
                                message.channel.send("....Harist sew? Tahseb li hemm dak n-numru?")
                            }
                        }else{
                            message.channel.send("Taf x'inu number? 1, 2, 3.... dak it-tip bahhu")
                        }
                    }else{
                        message.channel.send("B'min ha titnejjek?! Naf li mintiex WereWolf zibel!")
                    }
                }else{
                    message.channel.send("Mhux il-lejl, ghadek ma gejtx kollox suf, ma tistax tiekol nies")
                }
            }
        } else{
            message.channel.send("Ghada qas bdiet il-loghba, chilly your willy bro")
        }

        return
    }

    //Werewolf bridge here

    if(night_time && message.channel.type === "dm" && !werewolves_done){        
        var found = false;
        var comrades = [];
        for(var i = 0; i < werewolves_channels.length; i++){
            if(werewolves_channels[i].user.id === message.author.id){
                found = true;
            }else{
                comrades.push(werewolves_channels[i].channel)
            }            
        }

        if(found){
            for(var i = 0; i < comrades.length; i++){
                comrades[i].send(" - " + message.author.username + " qal: "  + message.content)
            }
        }
    }
});