import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('result', (t) => {
        t.increments('id')
        t.integer('player_id').references('id').inTable('player').notNullable()
        t.foreign('round_id').references('id').inTable('round').notNullable()
        t.string('drzava')
        t.string('grad')
        t.string('ime')
        t.string('biljka')
        t.string('zivotinja')
        t.string('planina')
        t.string('reka')
        t.string('predmet')
        t.integer('poeni').defaultTo(0).notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('result')
}

