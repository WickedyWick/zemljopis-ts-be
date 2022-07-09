# Zemljopis BE in TSP

This project is rewritten and upgraded version of https://github.com/WickedyWick/Zemljopis-NacionalnaGeografija

Old version hosted - [www.zemljopis.rs](www.zemljopis.rs)

Old version is working but its code and design is flawed and under bit more traffic it would cause problems.

I decided to rewritten it with new knowledge acquired to be up to industries standards

## Status
    In development (dev branch)

## Current branch
    origin/feature/game_start_1202487634315800

## Tech stack
NodeJS, Express, SocketsIO, Redis, postgresql, knex, jest

## About
Zemljopis grew from personal challenge to project that will is hosted and will be used by many people.

Idea is to help people learn about geography with fun.

This is digital version of IRL version of the game where you are playing on paper with group of friends that are next to you.

Using this application you can play with your friends anywhere and anytime.

Crossplay enabled.

Prototype mobile application already exists but is not yet published and will probably be rewritten in Flutter instead of Java to support all platforms and make it even more accessible.

[Existing prototype](https://github.com/WickedyWick/Zemljopis-Android)

This project is FREE and will stay FREE forever.

## Logic (work in progress)
Redis data is somewhat split under different keys

Every room has its own key with room data

Every player is registered under unique key {username}_{room} which contains their id, points and sessionToken

Player list for a room is under players_{room} key which is just an array of strings (rethink)

Data is precached into redis as hset of field_letter: field_data: 1 ; where field_letter is name of the hash set

## SETUP
git clone --recursive https://github.com/RediSearch/RediSearch.git
https://redis.io/docs/stack/search/quick_start/
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
    -> drzava_A : alzir: "1" ("1" je dummy data)

enable coalation u /etc/locale.gen pa napravi coaliciju pa napravi bazu . 
postgres linux user nije isti password za psql postgres usera -> alter user potgres PASSWORD 'passwrod';

FT.CREATE round-timer-idx ON HASH PREFIX 1 "round:timer:" SCHEMA roundId NUMERIC SORTABLE room TEXT NOSTEM SORTABLE expiresAt NUMERIC SORTABLE mode TEXT NOSTEM SORTABLE --> index command napravi u respu

decision -> samo prihvati nekosenu latinicu i cirilicu. nepismeni neka ne igraju

### Current biggest obstacle (mini blog)
Since this is a round based game there are timers, many timers.
I do not like idea of having lots of timer objects running at the same time.

Solution was to create index in redis with basic informaton about the room and expiresAt field that stores unix timestamp of when timer is supposed to expire and having one global timer running at 1 second interval.

At timer execution redis index is checked for any records wheere expiresAt < current timestamp. Since nodejs timers work that way if all things needed are not executed in set interval next execution won't start and it can cause delay.
Workaround this is just to dump tiny data fetched from redis to queue and delete redis key. Then queue is working on its own pace and not ommiting timer.

### Current sprint (Run to Alpha)
#### DONE
Middleware

Room, round, player creation

Join room

Ready up

Track sockets

Handle disconnect

Fill database with data

Precache data into redis

Handle round timers

Save player guesses

Use HINCRBY

Expand db schema

#### IN WORK / TODO
FE handling

Evaluation method

Testing

Look into TDD

Prep for alpha

Update README


### Backlog
UI/UX rework

IO should be global 

Transaction and full object loading instead of hot loading?

Use promise all

Reference id and not room_code

Redis OM?

Clearing data from redis after x amount of time

Implement match history

Implement kick

Socket auth

Implement word suggestion

Rethink ready logic

Accounts and leaderboards?

Public matches?

Basic chat

Rethink redis class logic
