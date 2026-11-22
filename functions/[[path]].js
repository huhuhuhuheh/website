import { discordEmbedResponse } from './_lib/discord-embeds.js'
import { discordEmbeds, discordErrorEmbeds } from './_lib/embeds.js'

export async function onRequest(context) {
  const embed = discordEmbedResponse(context.request, discordEmbeds, discordErrorEmbeds)
  if (embed) return embed
  return context.next()
}