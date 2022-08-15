import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('round', (t) => {
        t.increments('id').primary()
        t.string('room_code').references('room_code').inTable('room').notNullable()
        t.string('letter').notNullable()
        t.integer('round_number').notNullable()
        t.timestamps()
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('round')
}

