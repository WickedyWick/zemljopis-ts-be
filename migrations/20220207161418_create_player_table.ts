import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('player', (t) => {
        t.increments('id')
        t.string('room_code').references('room_code').inTable('room').notNullable()
        t.string('username').notNullable()
        t.string('session_token').notNullable()
        t.boolean('kicked').notNullable().defaultTo(false)
        t.timestamps()
        t.unique(['room_code','username'], 'player_room_code_username_unique')
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('player')
}

