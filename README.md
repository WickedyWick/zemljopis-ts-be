# Zemljopis BE in TSP

This project is rewritten and upgraded version of https://github.com/WickedyWick/Zemljopis-NacionalnaGeografija

## Status
    In development

## Relational and Non-relational DB will be used

In MySQL database will be stored pernament data and in non relational databse will be stored temporary data about active room for faster fetching and updating live data


enable coalation u /etc/locale.gen pa napravi coaliciju pa napravi bazu . 
postgres linux user nije isti password za psql postgres usera -> alter user potgres PASSWORD 'passwrod';

## Logic
Redis data is somewhat split under different keys

Every room has its own key with room data

Every player is registered under unique key {username}_{room} which contains their id, points and sessionToken
## TODO 


### SELFNOTES
Add error messages on FE and serve it and just send codes from server?
