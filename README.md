# Zemljopis BE in TSP

This project is rewritten and upgraded version of https://github.com/WickedyWick/Zemljopis-NacionalnaGeografija

ALFA version - [www.zemljopis.rs](www.zemljopis.rs)

Old version is working but its code and design is flawed and under bit more traffic it would cause problems.

I decided to rewritte it with new knowledge acquired to be up to industries standards and scalable.

## Status
    In development (dev branch)

## How to play
    If you want to start a game write your name in second input box and press first button
    If you want to join the game write room code in first input box, name in second and press second button

## Tech stack
NodeJS, Express, SocketsIO, Redis, PostgreSQL, Knex, Jest, Sentry, Plausible, TypeScript

Zemljopis grew from personal challenge to project that is hosted and will be used by many people.

Idea is to help people learn about geography with fun.

This is digital version of IRL version of the game where you are playing on paper with group of friends that are next to you.

Crossplay will be possibly once mobile application is developed.

Prototype mobile application already exists but is not yet published and will probably be rewritten in Flutter instead of Java to support all platforms and make it even more accessible.

[Existing prototype](https://github.com/WickedyWick/Zemljopis-Android)

This project is FREE and will stay FREE forever.

## Logic (work in progress)
Redis data is somewhat split under different keys

Every room has its own key with room data

Every player is registered under unique key {username}:{room} which contains their id, points and sessionToken

Player list for a room is under players:{room} key which is just an array of strings (rethink)

Data is precached into redis as hset of field_letter: field_data: 1 ; where field_letter is name of the hash set

## SETUP

setup db, fill .env file


```
git clone --recursive https://github.com/RediSearch/RediSearch.git
https://redis.io/docs/stack/search/quick_start/
```

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


Pipe resp:
```
echo -e "$(cat redisProtocol.txt)" | redis-cli --pipe
```

### Current biggest obstacle (mini blog)
Since this is a round based game there are timers, many timers.
I do not like idea of having lots of timer objects running at the same time.

Solution was to create index in redis with basic informaton about the room and expiresAt field that stores unix timestamp of when timer is supposed to expire and having one global timer running at 1 second interval.

At timer execution redis index is checked for any records wheere expiresAt < current timestamp. Since nodejs timers work that way if all things needed are not executed in set interval next execution won't start and it can cause delay.
Workaround this is just to dump tiny data fetched from redis to queue and delete redis key. Then queue is working on its own pace and not ommiting timer.

### Current sprint (Run to Alpha)

### Future plans

- Tests for socket functionalities
- Rejoin button (so you can rejoin last room without using browser commands)
- Cypress FE tests?
- Socket Auth
- Leaderboard
- Public games
- Simple canned chat
- Prevention of verbal abuse
- UI/UX rework
- Kick functionality
- Backend optimization
- Autopipelining to Redis
- Flutter mobile application for IOS and Android that enables crossplay
- Account system?
- Friend system?


### SELFNOTES
Add error messages on FE and serve it and just send codes from server?

// export script
sudo -u postgres psql -d zemljopis -c "copy player to '/tmp/test2.csv' with delimiter ',' csv header;"

room:letters -> key that holds letters for the room
cachovati u 8x30 keyeva ili 8 keyeva sa svim slovima? vrv 8x30
    letter and category are normalized to match postgres db , this is only exception for this format in redis
    -> drzava:A : alzir: "1" ("1" je dummy data)

suggest:{letter}:{category} -> Suggestion keys that are caching suggestions

enable coalation u /etc/locale.gen
pa sudo locale-gen sr_RS.UTF-8 <- kreiranje locala
create database zemljopis with template = template0 lc_collate = "sr_RS.UTF-8" lc_ctype= "sr_RS.UTF-8" encoding = "UTF-8";

postgres linux user nije isti password za psql postgres usera -> alter user potgres PASSWORD 'passwrod';

FT.CREATE round-timer-idx ON HASH PREFIX 1 "round:timer:" SCHEMA roundId NUMERIC SORTABLE room TEXT NOSTEM SORTABLE expiresAt NUMERIC SORTABLE mode TEXT NOSTEM SORTABLE --> index command napravi u respu

decision -> samo prihvati nekosenu latinicu i cirilicu. nepismeni neka ne igraju


localdb pass postgres