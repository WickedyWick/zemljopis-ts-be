import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('result', (t) => {
        t.increments('id').primary()
        t.integer('player_id').references('id').inTable('player').notNullable()
        t.integer('round_id').references('id').inTable('round').notNullable()
        t.string('drzava').defaultTo('').notNullable()
        t.integer('points_dr').defaultTo(0).notNullable()
        t.string('grad').defaultTo('').notNullable()
        t.integer('points_gr').defaultTo(0).notNullable()
        t.string('ime').defaultTo('').notNullable()
        t.integer('points_im').defaultTo(0).notNullable()
        t.string('biljka').defaultTo('').notNullable()
        t.integer('points_bl').defaultTo(0).notNullable()
        t.string('zivotinja').defaultTo('').notNullable()
        t.integer('points_zv').defaultTo(0).notNullable()
        t.string('planina').defaultTo('').notNullable()
        t.integer('point_pl').defaultTo(0).notNullable()
        t.string('reka').defaultTo('').notNullable()
        t.integer('points_rk').defaultTo(0).notNullable()
        t.string('predmet').defaultTo('').notNullable()
        t.integer('points_pr').defaultTo(0).notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('result')
}

