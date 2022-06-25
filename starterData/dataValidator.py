

from asyncio import new_event_loop
from posixpath import split


w = open('drzaveN.txt', 'w', encoding="UTF-8")
with open('drzave.txt', encoding='UTF-8') as f:
    lines = f.readlines()
    for line in lines:
        splitted = line.split('|')
        if (len(splitted) > 0):
            new = f'{splitted[0]}|{splitted[len(splitted) - 1]}'
            w.write(new)
w.close()

w1 = open('gradoviN.txt', 'w', encoding="UTF-8")
with open('gradovi.txt', encoding='UTF-8') as f:
    lines = f.readlines()
    for line in lines:
        splitted = line.split('|')
        if (len(splitted) > 0):
            new = f'{splitted[0]}|{splitted[len(splitted) - 1]}'
            w1.write(new)
w1.close()

w2 = open('imenaN.txt', 'w', encoding="UTF-8")
with open('imena.txt', encoding='UTF-8') as f:
    lines = f.readlines()
    for line in lines:
        splitted = line.split('|')
        if (len(splitted) > 0):
            new = f'{splitted[0]}|{splitted[len(splitted) - 1]}'
            w2.write(new)
w2.close()

w3 = open('biljkeN.txt', 'w', encoding="UTF-8")
with open('biljke.txt', encoding='UTF-8') as f:
    lines = f.readlines()
    for line in lines:
        splitted = line.split('|')
        if (len(splitted) > 0):
            new = f'{splitted[0]}|{splitted[len(splitted) - 1]}'
            w3.write(new)
w3.close()

w4 = open('zivotinjeN.txt', 'w', encoding="UTF-8")
with open('zivotinje.txt', encoding='UTF-8') as f:
    lines = f.readlines()
    for line in lines:
        splitted = line.split('|')
        if (len(splitted) > 0):
            new = f'{splitted[0]}|{splitted[len(splitted) - 1]}'
            w4.write(new)
w4.close()

w5 = open('planineN.txt', 'w', encoding="UTF-8")
with open('planine.txt', encoding='UTF-8') as f:
    lines = f.readlines()
    for line in lines:
        splitted = line.split('|')
        if (len(splitted) > 0):
            new = f'{splitted[0]}|{splitted[len(splitted) - 1]}'
            w5.write(new)
w5.close()

w6 = open('rekeN.txt', 'w', encoding="UTF-8")
with open('reke.txt', encoding='UTF-8') as f:
    lines = f.readlines()
    for line in lines:
        splitted = line.split('|')
        if (len(splitted) > 0):
            new = f'{splitted[0]}|{splitted[len(splitted) - 1]}'
            w6.write(new)
w6.close()

w7 = open('predmetiN.txt', 'w', encoding="UTF-8")
with open('predmeti.txt', encoding='UTF-8') as f:
    lines = f.readlines()
    for line in lines:
        splitted = line.split('|')
        if (len(splitted) > 0):
            new = f'{splitted[0]}|{splitted[len(splitted) - 1]}'
            w7.write(new)
w7.close()





