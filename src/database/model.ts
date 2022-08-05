import knex from 'knex'
import { db } from 'database'
import { Keyed, Maybe } from 'utils/typings'
import { formatISO } from 'date-fns'
import { logError } from 'utils/logger'


export type ModelDate = Date | string

export type Model<Fields = {}, Methods = {}> = {
    update: (fields: Partial<Fields> & Keyed) => Model<Fields, Methods>
    del: () => Promise<void>
    save: () => Promise<void>
    pristine: Fields
} & Fields & Methods

export interface ModelShape<ModelFields extends {},ModelMethods extends {}> {
    name: string
    fields: string[]
    instanceMethods: ModelMethods
    
    override?: (raw: any) => Promise<ModelFields>
    prep: {
        (fields: Maybe<ModelFields>): Promise<Maybe<ModelFields & ModelMethods>>
    }

    q: knex.QueryBuilder

    // can be replaced with Promise<Maybe<ModelFields>> probably
    findOne: (id: number) => Promise<ModelFields | undefined>
    findBy: (id: number) => Promise<ModelFields | undefined>
    findAll: (where: keyof ModelFields, is: any) => Promise<ModelFields[] | undefined> 
}

interface QueryOptions {
    fail?: boolean
}

type ModelHook<G> = (model: G) => Promise<void> | void

export class BaseModel<Fields extends {}, Methods> implements ModelShape<Fields, Methods> {
    name: string
    fields: string[]
    filterGroups: object[]
    instanceMethods: Methods
    override?: (raw: any) => Promise<Fields>

    hooks: Partial<{
        create: ModelHook<Model<Fields, Methods>>
        update: ModelHook<Model<Fields, Methods>>
        delete: ModelHook<Model<Fields, Methods>>

    }>

    constructor(name: string) {
        this.name = name
    }

    get q() {
        return db<Fields>(this.name).queryContext({ prep: this.prep })
    }

    prep = async (fields: Fields) => {
        if (fields) {
            if (this.override) {
                fields = await this.override(fields)
            }

            return {
                ...fields,
                ...this.baseInstanceMethods,
                ...this.instanceMethods,
                q: this.q,
                fields: this.fields,
                get pristine() {
                    return fields
                },
                toJSON: function() {
                    return this.pristine
                },
                hooks: this.hooks
            }
        }

        return undefined
    }

    findOne = async (id: number | string , options: QueryOptions = {}) => {
        if (!id) return undefined
        const record = await this.q.where('id', '=', id).first(this.fields) as any
        
        if (!record && options.fail) return undefined

        return record as Maybe<Model<Fields, Methods>>
    }

    findBy = async (queryObj: { [K in keyof Fields]?: any }, options: QueryOptions = {}) => {
        let record = await this.q.where(queryObj).first(this.fields) as any

        if (!record && options.fail) return undefined

        return record as Maybe<Model<Fields, Methods>>
    }
    // this is only for = searches
    findAll = async (where?: keyof Fields, is?: any, options: QueryOptions = {}) => {
        let records = await (where ? this.q.where(where as string, is): this.q).select(this.fields) as any

        if ((!records || records == []) && options.fail) return undefined

        return records as Maybe<Model<Fields, Methods>[]>
    }

    // this will work for custom operators as well but will also return all
    where = async (queryObj: { [K in keyof Fields]?: any }, options: QueryOptions = {}) => {
        let records = await this.q.where(queryObj).select(this.fields) as any
        
        if ((!records || records == []) && options.fail) return undefined 

        return records as Maybe<Model<Fields,Methods>[]>
    }

    create = async (fields: Partial<Fields> & Keyed = {}, returning?: boolean | string[]) => {
        // @ts-ignore
        fields.created_at =  formatISO(new Date())
        // @ts-ignore
        fields.updated_at = formatISO(new Date())
        const record = (
            await this
                .q
                .returning([ 
                    'id',
                    ...(returning ? Array.isArray(returning) ? returning : Object.keys(fields) : this.fields)
                ])
                //@ts-ignore
                .insert(fields)
        )[0] as Model<Fields,Methods>

        // maybe this should go before first record creation
        if (this.hooks?.create) {
            await this.hooks.create(record)
        }

        return record
       
    }

    findOrCreateBy = async(fields: Partial<Fields> & Keyed = {}) => {
        let record = await this.findBy(fields)
        if (!record) {
            record = await this.create(fields)
        }
        return record
    }

    baseInstanceMethods = {
        async update(fields: Partial<Fields> & Keyed = {}) {
            if (this.fields && this.fields.includes('updated_at')) {
                // @ts-ignore
                fields.updated_at = formatISO(new Date())
            }

            const updatedObjects = await this.q.where({ id: this.id }).update(fields, this.fields)

            if (updatedObjects.length > 0) {
                const newObj = updatedObjects[0]
                for (const [key, value] of Object.entries(newObj.pristine)) {
                    this[key] = value
                    this.pristine[key] = value
                }
            }

            if (this.hooks?.update) {
                this.hooks.update(this)
            }
        },
        async del() {
            const deleted = await this.q.where({ id: this.id }).del()
            if (this.hooks?.delete) {
                this.hooks.delete(this)
            }
        },
        async save() {
            let data = {}
            for (const field of this.fields) {
                // @ts-ignore
                data[field] = this[field]
            }
            await this.update(data)
        },
    }

}