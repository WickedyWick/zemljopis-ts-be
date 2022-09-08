# Script that takes data from word data file and parses it into html row and cell format
import csv

letterList = [
    'A',
    'B',
    'V',
    'G',
    'D',
    'Đ',
    'E',
    'Ž',
    'Z',
    'I',
    'J',
    'K',
    'L',
    'LJ',
    'M',
    'N',
    'NJ',
    'O',
    'P',
    'R',
    'S',
    'T',
    'Ć',
    'U',
    'F',
    'H',
    'C',
    'Č',
    'DŽ',
    'Š',
]

categoryList = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
]
with open('./seeds/fieldData.csv', 'r', encoding='utf-8') as f:
    csv_reader = csv.reader(f, delimiter=',')
    next(csv_reader)
    dic = {}
    for row in csv_reader:
        if(row[0] == '' or row[1] == '' or row[2] == ''):
            continue
        data = row[0]
        letter = row[1]
        cat = row[2]
        if f'{letter}_{cat}' in dic:
            continue
        else:
            dic[f'{letter}_{cat}'] = data
            
with open('./scripts/temp.txt', 'w', encoding='utf-8') as f:
    for i in range(len(letterList)):
        rowNoTag = f'<th scope="row">{letterList[i]}</th>'
        for j in range(len(categoryList)):
            data = dic.get(f'{letterList[i]}_{categoryList[j]}','').capitalize()
            rowNoTag = rowNoTag + f'<td>{data}</td>'
        f.write(f'<tr style="text-align:center">{rowNoTag}</tr>\n')
        