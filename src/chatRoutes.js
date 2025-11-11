import OpenAI from 'openai';


async function chatRoutes(app, options) {

    app.post('/chat', async (request, reply) => {
        console.log(process.env.OPENAI_API_KEY);

        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        const response = await client.responses.create({
            model: "gpt-4.1",
            instructions: `Talk like dialogue subtitles. Write in small paragraphs, without dashes or bullet points. Format your response as a JSON array where each
            element has a dialogue, a geographic_coordinate in the form [lon, lat] and a zoom_level. The coordinate is a location that best illustrates the explanation in the dialogue.`,
            input: JSON.stringify({'user_message': request.body.q?.substring(0, 100)}),
            tools:[],
            max_output_tokens: 1000
        });

        console.log(response);

        return reply.send( { message : response.output_text } );
    });
}

export { chatRoutes };