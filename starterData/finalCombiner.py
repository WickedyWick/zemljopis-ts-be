import csv
import os
dirname = os.path.dirname(os.path.abspath(__file__))
print(dirname)
filename = dirname.replace('/starterData', '/seeds/fieldData.csv')


header = ['data', 'letter', 'category_id']

data = []
with open('drzaveN.txt', encoding='UTF-8') as f:
    lines = f.readlines()
    for line in lines:
        splitted = line.strip().split('|')
        data.append([splitted[0],splitted[1].upper(),0])
with open('gradoviN.txt', encoding='UTF-8') as f:
    lines = f.readlines()
    for line in lines:
        splitted = line.strip().split('|')
        data.append([splitted[0],splitted[1].upper(),1])

with open('imenaN.txt', encoding='UTF-8') as f:
    lines = f.readlines()
    for line in lines:
        splitted = line.strip().split('|')
        data.append([splitted[0],splitted[1].upper(),2])

with open('biljkeN.txt', encoding='UTF-8') as f:
    lines = f.readlines()
    for line in lines:
        splitted = line.strip().split('|')
        data.append([splitted[0],splitted[1].upper(),3])

with open('zivotinjeN.txt', encoding='UTF-8') as f:
    lines = f.readlines()
    for line in lines:
        splitted = line.strip().split('|')
        data.append([splitted[0],splitted[1].upper(),4])
with open('planineN.txt', encoding='UTF-8') as f:
    lines = f.readlines()
    for line in lines:
        splitted = line.strip().split('|')
        data.append([splitted[0],splitted[1].upper(),5])
with open('rekeN.txt', encoding='UTF-8') as f:
    lines = f.readlines()
    for line in lines:
        splitted = line.strip().split('|')
        data.append([splitted[0],splitted[1].upper(),6])        
with open('predmetiN.txt', encoding='UTF-8') as f:
    lines = f.readlines()
    for line in lines:
        splitted = line.strip().split('|')
        data.append([splitted[0],splitted[1].upper(),7])

with open(filename, 'w', encoding='UTF-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(header)
    writer.writerows(data)
