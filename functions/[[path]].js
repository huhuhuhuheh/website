import { discordEmbedResponse } from './_lib/discord-embeds.js'
import { discordEmbeds } from './_lib/embeds.js'

export async function onRequest(context) {
  const embed = discordEmbedResponse(context.request, discordEmbeds)
  if (embed) return embed
  return context.next()
}