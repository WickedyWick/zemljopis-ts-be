import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('room', (t) => {
        t.increments('id').primary()
        t.string('room_code').checkLength('=',8).unique().notNullable()
        t.integer('player_count',2).notNullable()
        t.integer('round_time_limit').checkIn(['180', '120','90','60']).notNullable().defaultTo(60)
        t.boolean('active').notNullable().defaultTo(true)
        t.timestamps()
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('room')
}

