import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('table_name').del();

    // Inserts seed entries
    await knex('table_name').insert([
        { id: 0, colName: 'Drzava' },
        { id: 1, colName: 'Grad' },
        { id: 2, colName: 'Ime' },
        { id: 3, colName: 'Biljka' },
        { id: 4, colName: 'Zivotinja' },
        { id: 5, colName: 'Planina' },
        { id: 6, colName: 'Reka' },
        { id: 7, colName: 'Predmet' }
    ]);
};
