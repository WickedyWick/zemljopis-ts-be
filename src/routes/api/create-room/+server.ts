import type { CreateRoomDto } from '$lib/types/types';
import { createRoomService, logError, createRoomValidator } from '$lib/server'
import type { RequestHandler } from './$types';
export const POST: RequestHandler = async ({request}) => {
    try {
        const body: CreateRoomDto = await request.json() as CreateRoomDto
        const isValid: boolean | undefined = await createRoomValidator(body)
        if (isValid == undefined)
            return new Response(null, {status: 500})
        if (isValid == false)
            return new Response(null, {status: 400})

        let res: string | undefined = await createRoomService(body)
        if (!res)
            return new Response(null, {status: 500})
        return new Response(res, {status: 201})
    } catch(err) {
        // if body is not valid json
        if (err instanceof SyntaxError) {
            return new Response(null, {status: 400})
        }
        await logError(String(err), 'api\\create-room POST')
        return new Response(null, {status: 500})
    }
};