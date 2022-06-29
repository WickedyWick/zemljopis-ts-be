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
Player list for a room is under players_{room} key which is just an array of strings

Data is precached into redis as hset of field_letter: field_data: 1 ; where field_letter isname of the hash set amnd

## TODO 
Track socket id and make a room when first player joins ( i guess i can join every event cause if itdoesnt exist it will create a room)
Register joining other players and make sure its all working propertly
Implement translator on FE
Extend db for data

## SETUP
setup db, fill .env file

Install packages
```
yarn install 
```

Import data in redis (for caching):
```
python3 ./seeds/convertToRedisProtocol.py
```

Start postgresql database on linux:
```
sudo service postgresql start
```

Start redis server:
```
redis-server
```

Run latest migrations:
```
yarn migrate
```

Seed database:
```
yarn seed
```

Run tests:
```
yarn test
```

Start application:
```
yarn dev
```

### SELFNOTES
Add error messages on FE and serve it and just send codes from server?

// export script
sudo -u postgres psql -d zemljopis -c "copy player to '/tmp/test2.csv' with delimiter ',' csv header;"

cachovati u 8x30 keyeva ili 8 keyeva sa svim slovima? vrv 8x30
    letter and category are normalized to match postgres db , this is only exception for this format in redis
    -> Drzava_A : alzir: "1" ("1" je dummy data)


db cuvaa kosenih nekti u cirlici jer nemosenih i to ce biti  -> nece moci ako ne konstienti bude input... 
decision -> samo prihvati nekosenu latinicu i cirilicu. nepismeni neka ne igraju
