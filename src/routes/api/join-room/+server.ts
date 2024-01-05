import { joinRoomService } from '$lib/server/services/indexServices';
import type { JoinRoomDto } from '$lib/types/types';
import { joinRoomValidator } from '$lib/utils/validators/joinRoomValidator';
import type { RequestHandler } from './$types';
import { logError } from '$lib/server/db/commands';
export const POST: RequestHandler = async ({request}) => {
   try {
        const body: JoinRoomDto = await request.json() as JoinRoomDto
        const isValid: boolean | undefined = await joinRoomValidator(body)
        if (isValid == undefined)
            return new Response(null, {status: 500})
        if (isValid == false)
            return new Response(null, {status: 400})

        let res: number = await joinRoomService(body)
        return new Response(null, {status: res})
    } catch(err) {
        // if body is not valid json
        if (err instanceof SyntaxError) {
            return new Response(null, {status: 400})
        }
        await logError(String(err), 'api\\join-room POST')
        return new Response(null, {status: 500})
    }
};