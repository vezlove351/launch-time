import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const ideogramApiKey = process.env.NEXT_PUBLIC_IDEOGRAM_API_KEY

    if (!ideogramApiKey) {
      console.error('Ideogram API key is not configured')
      return NextResponse.json(
        { error: 'Ideogram API key is not configured' }, 
        { status: 500 }
      )
    }

    console.log('Sending request to Ideogram API...')
    const url = 'https://api.ideogram.ai/generate'
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': ideogramApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_request: {
          prompt: prompt,
          aspect_ratio: "ASPECT_1_1",
          model: "V_2",
          magic_prompt_option: "AUTO"
        }
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Ideogram API error:', errorData)
      return NextResponse.json(
        { error: `Ideogram API error: ${errorData}` }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    if (!data.data || !data.data[0] || !data.data[0].url) {
      console.error('Unexpected response from Ideogram API:', data)
      return NextResponse.json(
        { error: 'Ideogram API did not return an image URL' }, 
        { status: 500 }
      )
    }

    console.log('Successfully generated image URL:', data.data[0].url)
    return NextResponse.json({ imageUrl: data.data[0].url })
  } catch (error) {
    console.error('Error generating image:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: 'Failed to generate image', details: errorMessage }, 
      { status: 500 }
    )
  }
}

