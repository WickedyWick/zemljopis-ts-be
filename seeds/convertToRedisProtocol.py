import csv

'''
Script used to generate REsp protocol from csv file to bulk load data in redis
'''
fieldNums = ['Drzava', 'Grad', 'Ime', 'Biljka', 'Zivotinja', 'Planina', 'Reka', 'Predmet']
# header is data,letter,category_id
redisProtocolFile = open('./seeds/redisProtocol.txt', 'w', encoding='UTF-8')
with open('./seeds/fieldData.csv', 'r', encoding='UTF-8') as f:
    csv_reader = csv.reader(f, delimiter=',')
    # skips header
    next(csv_reader)
    count = 0
    for row in csv_reader:
        if(row[0] == '' or row[1] == '' or row[2] == ''):
            continue
        category = fieldNums[int(row[2])]
        letter = row[1]
        # + 1 offset is length of _
        lenOfFieldCategory = len(category.encode('utf-8')) + len(letter.encode('utf-8')) + 1
        lenOfData = len(row[0].encode('utf-8'))
        data = row[0]
        redisProtocolFile.write(f'*4\\r\\n$4\\r\\nHSET\\r\\n${lenOfFieldCategory}\\r\\n{category}_{letter}\\r\\n${lenOfData}\\r\\n{data}\\r\\n$1\\r\\n1\\r\\n\n')
