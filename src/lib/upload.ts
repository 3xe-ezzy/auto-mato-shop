import { put } from '@vercel/blob'

export async function uploadImage(file: File): Promise<string> {
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`

    const blob = await put(filename, file, {
        access: 'public',
    })

    return blob.url
}
