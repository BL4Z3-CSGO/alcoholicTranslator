local debug = false;
local say = function(str) 
    client.ChatSay(str);
end;
local me = function() 
    return client.GetLocalPlayerIndex();
end;
local name = function(num)
	num = num or 1
    return tostring(client.GetPlayerNameByIndex(num));
end;
local dbgLog = function(str)
    if debug then
        print(str);
    end;
end;

local serverIP = "127.0.0.1";
local serverPort = 7454;
local clientIP = "127.0.0.1";
local clientPort = 7453;

local server = network.Socket("UDP");
local client = network.Socket("UDP");

if server:Bind(serverIP, serverPort) then
    print("alcoholicTranslator clientside online: " .. serverIP .. ":" .. serverPort);
end

callbacks.Register( "Draw", function()
    local msg, ip, port = server:RecvFrom(clientIP, clientPort, 10000);
    local index, text, final
    local array = {}
    for w in tostring(msg):gmatch("([^;]+)") do 
        table.insert(array, w) 
    end
    if array[2] ~= nil then
		dbgLog(msg);
        dbgLog(index);
        local index = tonumber(array[1]);
        text = tostring(name(index) .. ": " .. array[2]);
        final = string.gsub(string.sub(text,0,127), ";", " ");
        print(final);
		say(final);
    end
end )

local function UserMessageCallback(msg)  
    if msg:GetID() == 6 then
        local index = msg:GetInt( 1 );
        dbgLog(index);
        if index ~= me() then
            local message = tostring(msg:GetString( 4, 1 ));
			dbgLog(message);
			local send = tostring(index) .. ";" .. message:gsub(";", " ");
			dbgLog(send);
            client:SendTo(clientIP, clientPort, tostring(send));
        end
    end    
end
callbacks.Register("DispatchUserMessage", UserMessageCallback);