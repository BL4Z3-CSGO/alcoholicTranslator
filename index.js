/* jshint asi: true */
const debug = false
var lang = "en"

const http = require("https")
const readline = require('readline')
const dgram = require('dgram')
const fs = require('fs')
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
var key
try {
    var key = fs.readFileSync('./apikey.txt', 'utf8');
} catch (e) {
    key = ""
}
function dbgLog(s) {
    if (debug) {console.log(s)}
}
function main() {
    var apiOptions = {
        "method": "POST",
        "hostname": "microsoft-translator-text.p.rapidapi.com",
        "port": null,
        "path": `/translate?api-version=3.0&to=${lang}&textType=plain&profanityAction=NoAction`,
        "headers": {
            "content-type": "application/json",
            "x-rapidapi-key": key,
            "x-rapidapi-host": "microsoft-translator-text.p.rapidapi.com",
            "useQueryString": true
        }
    }
    var server = dgram.createSocket('udp4')
    var client = dgram.createSocket('udp4')
    var serverPort = 7453
    var serverAddr = '127.0.0.1'
    server.on('listening', function () {
        var address = server.address()
        console.log('alcoholicTranslator serverside online: ' + address.address + ':' + address.port);
    });
    server.on('message', function (message, remote) {
        try {
            dbgLog("Incoming Packet: " + String(message))
            array = String(message).split(";")
            var req = http.request(apiOptions, function (res) {
                const chunks = []
                res.on("data", function (chunk) {
                    chunks.push(chunk)
                })
                res.on("end", function () {
                    const body = Buffer.concat(chunks)
                    var response = body.toString()
                    if (JSON.parse(response).message) {
                        console.log("Error: " + JSON.parse(response).message);
                        fs.writeFileSync("./apikey.txt", "", {
                            flag: 'w'
                        })
                        process.exit()
                    } else {
                        parsedResponse = JSON.parse(response)[0].translations[0].text
                        translatedPacket = array[0] + ";" + parsedResponse.replace(";", "")
                        console.log(`translated: ${parsedResponse}`)
                        if (String(parsedResponse).toLowerCase() != String(array[1]).toLowerCase()) {
                            dbgLog("Outgoing Packet: " + translatedPacket)
                            client.send(translatedPacket, (err) => {})
                        } else {
                            dbgLog("Translated Version is equal to Original.")
                        }
                    }
                })
            })
            req.write(JSON.stringify([{
                Text: String(array[1])
            }]))
            req.end()
            console.log(`translating: ${array[1]}`)
        } catch (e) {
            console.log(String(e))
        }
    })
    server.bind(serverPort, serverAddr)
    client.connect(7454, 'localhost')
}
if (key == "") {
    rl.question('Please enter API key: ', (ans) => {
        key = ans
        rl.close()
        fs.writeFileSync("./apikey.txt", key, {
            flag: 'w+'
        })
        main()
    });
} else {
    main()
}
