import { NodeHtmlMarkdown } from 'node-html-markdown'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    const accept = getRequestHeader(event, 'accept') || ''
    if (!accept.includes('text/markdown')) return
    if (typeof response.body !== 'string') return

    const markdown = NodeHtmlMarkdown.translate(response.body)
    response.body = markdown
    response.headers = response.headers || {}
    response.headers['content-type'] = 'text/markdown'
    // Rough token estimate for GPT-style tokenizers
    response.headers['x-markdown-tokens'] = String(Math.ceil(markdown.length / 4))
  })
})
