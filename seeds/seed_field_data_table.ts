import { Knex } from "knex";
import { createReadStream } from 'fs'
import { parse } from 'csv-parse'
import getStream from 'get-stream'

interface FieldData {
    data: string
    letter: string
    category_id: number
}
export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("field_data").del();

    const stream = await createReadStream('./seeds/fieldData.csv')
    const data = await getStream.array(stream.pipe(parse({ delimiter: ',', from_line: 1, columns: true, cast: true })))

    // in case this becomes memory issue split inserts in chunks
    let insertArray: FieldData[] = []
    //@ts-ignore
    data.forEach((element: FieldData) => {
        insertArray.push({
            data: element.data,
            letter: element.letter,
            category_id: element.category_id
        })
    });
    // Inserts seed entries
    await knex("field_data").insert(insertArray);
};
