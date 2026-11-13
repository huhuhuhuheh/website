import { legalServices } from '../../src/data/legal.js'

const SITE = 'https://ehis.gay'
const PINK = 0xf2c6de
const PINK_MID = 0xd494b7
const LOGO = `${SITE}/src/img/icon.png`

const linkButton = (url, label) => ({ type: 2, style: 5, url, label })

function legalUrl(link) {
  if (!link) return ''
  if (link.href) return link.href
  if (link.to) return `${SITE}${link.to}`
  return ''
}

function legalButtons(kind) {
  return legalServices
    .map((service) => {
      const link = service[kind]
      const url = legalUrl(link)
      return url ? linkButton(url, `${service.name} ${link.label}`) : null
    })
    .filter(Boolean)
}

function legalRows(kind) {
  const buttons = legalButtons(kind)
  const rows = []
  for (let i = 0; i < buttons.length; i += 5) {
    rows.push({ type: 1, components: buttons.slice(i, i + 5) })
  }
  return rows
}

export const discordEmbeds = {
  '/': {
    accentColor: PINK,
    og: {
      title: 'ehis.gay',
      description: "ello. it's ehis.gay. does stuff, so it is something.",
      image: LOGO
    },
    components: [
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `## [ehis.gay](${SITE})\nello. i do stuff, okay? :3`
          }
        ],
        accessory: { type: 11, media: { url: LOGO } }
      },
      { type: 14, spacing: 1 },
      {
        type: 1,
        components: [
          linkButton(`${SITE}/stuff`, 'Stuff'),
          linkButton(`${SITE}/ehnewtab`, "Eh's New Tab"),
          linkButton('https://bsky.app/profile/did:plc:hhi5ppq45rmexzxcld2f2vzx', 'Bluesky')
        ]
      }
    ]
  },

  '/stuff': {
    accentColor: PINK_MID,
    og: {
      title: 'Stuff',
      description: 'browser extensions and themes eh made.',
      image: LOGO
    },
    components: [
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `## [Stuff](${SITE}/stuff)\nbrowser extensions and themes eh made.`
          }
        ],
        accessory: { type: 11, media: { url: LOGO } }
      },
      { type: 14, spacing: 1 },
      {
        type: 1,
        components: [
          linkButton(`${SITE}/ehnewtab`, "Eh's New Tab"),
          linkButton(`${SITE}/wallpapers`, 'Wallpapers & Others'),
          linkButton(`${SITE}/downloads`, 'Downloads')
        ]
      }
    ]
  },

  '/ehnewtab': {
    accentColor: PINK,
    og: {
      title: "Eh's New Tab",
      description:
        "Eh's New Tab, as its name says, simply offers you a simple New Tab experience without any glossy bloat or unnecessary stuff, and without any messy configuration (weather, image quotes, etc).",
      image: `${SITE}/src/img/addon/ehnewtab/newnormal.png`
    },
    components: [
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `## [Eh's New Tab](${SITE}/ehnewtab)\nEh's New Tab, as its name says, simply offers you a simple New Tab experience without any glossy bloat or unnecessary stuff, and without any messy configuration (weather, image quotes, etc).`
          }
        ],
        accessory: { type: 11, media: { url: `${SITE}/src/img/addon/ehnewtab/broicon.png` } }
      },
      { type: 14, spacing: 1 },
      {
        type: 10,
        content: `**NO TRACKING, NO BLOAT, EVER:**\nThe extension does not connect to any of eh's services, includes no telemetry, and adds no ads, weather or similar junk, so you don't have to worry about your data!*\n**JUST A BACKGROUND, WITHOUT THE CORPORATE:**\nApart from reddit, it lets you grab backgrounds from safebooru, any Redlib instance, any URL you want, or just a static image from your device!\n**IT HAS THEMES:**\nIt comes with built-in ones, but if you feel those aren't good enough, you can make your own with CSS!\n**DOODLES & MORE:**\nEh's New Tab offers a doodle system (similar to Google's doodles, but our own) so your new tab can get stupid, silly, and random seasonal doodles that show up on their own!\n-# * This does not apply when it connects to safebooru, Reddit, any Redlib instance, or any URL you choose, in order to fetch a background.`
      },
      {
        type: 12,
        items: [
          {
            media: { url: `${SITE}/src/img/addon/ehnewtab/newnormal.png` },
            description: 'the default new tab'
          },
          {
            media: { url: `${SITE}/src/img/addon/ehnewtab/settings.png` },
            description: 'the settings page'
          },
          {
            media: { url: `${SITE}/src/img/addon/ehnewtab/searchengine.png` },
            description: 'search engine settings'
          },
          {
            media: { url: `${SITE}/src/img/addon/ehnewtab/halloween.png` },
            description: 'halloween doodle'
          }
        ]
      },
      { type: 14, spacing: 1 },
      {
        type: 1,
        components: [
          linkButton('https://addons.mozilla.org/addon/ehnewtab/', 'Firefox'),
          linkButton(
            'https://chrome.google.com/webstore/detail/bbbhgkjjohfoaefdaljchaoagaegjbpa',
            'Chrome'
          ),
          linkButton(
            'https://microsoftedge.microsoft.com/addons/detail/pegbljbkaiefhknapfbfdodeephfiabp',
            'Edge'
          )
        ]
      },
      {
        type: 1,
        components: [linkButton('https://github.com/ehshit/ehnewtab/', 'Source on GitHub')]
      }
    ]
  },

  '/wallpapers': {
    accentColor: PINK_MID,
    og: {
      title: 'Wallpapers & Others',
      description: 'desktop wallpapers, cursors and other little things.',
      image: `${SITE}/src/img/desk-backgro/gtl.jpg`
    },
    components: [
      {
        type: 10,
        content: `## [Wallpapers & Others](${SITE}/wallpapers)\ndesktop wallpapers, cursors and other little things.`
      },
      {
        type: 12,
        items: [
          {
            media: { url: `${SITE}/src/img/desk-backgro/gtl.jpg` },
            description: 'girls last tour wallpaper'
          }
        ]
      },
      { type: 14, spacing: 1 },
      {
        type: 1,
        components: [
          linkButton(`${SITE}/wallpapers`, 'Wallpapers'),
          linkButton(`${SITE}/downloads`, 'Downloads'),
          linkButton(`${SITE}/stuff`, 'Stuff')
        ]
      }
    ]
  },

  '/downloads': {
    accentColor: PINK,
    og: {
      title: 'Downloads',
      description: 'downloads for anything. cursors, minecraft modpacks and resource packs.',
      image: LOGO
    },
    components: [
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `## [Downloads](${SITE}/downloads)\ndownloads for anything. cursors, minecraft modpacks and resource packs.`
          }
        ],
        accessory: { type: 11, media: { url: LOGO } }
      },
      { type: 14, spacing: 1 },
      {
        type: 1,
        components: [
          linkButton(`${SITE}/downloads`, 'Downloads'),
          linkButton(`${SITE}/wallpapers`, 'Wallpapers'),
          linkButton(`${SITE}/stuff`, 'Stuff')
        ]
      }
    ]
  },

  '/donate': {
    accentColor: PINK_MID,
    og: {
      title: 'Donate!',
      description: 'help pay for domains, servers and other stuff, via PayPal or Ko-fi.',
      image: LOGO
    },
    components: [
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `## [Donate!](${SITE}/donate)\nhelp pay for domains, servers and other stuff, via PayPal or Ko-fi.`
          }
        ],
        accessory: { type: 11, media: { url: LOGO } }
      },
      { type: 14, spacing: 1 },
      {
        type: 1,
        components: [
          linkButton(`${SITE}/donate`, 'Donate'),
          linkButton('https://ko-fi.com/whyiexist', 'Ko-fi')
        ]
      }
    ]
  },

  '/terms': {
    accentColor: PINK_MID,
    og: {
      title: 'Terms',
      description: 'terms of service and privacy policies for the services.',
      image: LOGO
    },
    components: [
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `## [Terms](${SITE}/terms)\nservices that have terms of service and privacy policies because of legal shenanigans.`
          }
        ],
        accessory: { type: 11, media: { url: LOGO } }
      },
      { type: 14, spacing: 1 },
      ...legalRows('terms'),
      ...legalRows('privacy')
    ]
  },

  '/legal/api/tos': {
    accentColor: PINK,
    og: {
      title: 'api.ehis.gay terms of service',
      description: 'free to use for general stuff, with a few rules for the boobs sync.',
      image: LOGO
    },
    components: [
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `## [api.ehis.gay terms](${SITE}/legal/api/tos)\nfree to use for general stuff, with a few rules for the boobs sync.`
          }
        ],
        accessory: { type: 11, media: { url: LOGO } }
      },
      { type: 14, spacing: 1 },
      {
        type: 1,
        components: [
          linkButton(`${SITE}/legal/api/privacy`, 'Privacy'),
          linkButton(`${SITE}/terms`, 'All terms')
        ]
      }
    ]
  },

  '/legal/api/privacy': {
    accentColor: PINK,
    og: {
      title: 'api.ehis.gay privacy policy',
      description: 'what actually happens with your data.',
      image: LOGO
    },
    components: [
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `## [api.ehis.gay privacy](${SITE}/legal/api/privacy)\nwhat actually happens with your data.`
          }
        ],
        accessory: { type: 11, media: { url: LOGO } }
      },
      { type: 14, spacing: 1 },
      {
        type: 1,
        components: [
          linkButton(`${SITE}/legal/api/tos`, 'Terms'),
          linkButton(`${SITE}/terms`, 'All terms')
        ]
      }
    ]
  },

  '/license': {
    accentColor: PINK_MID,
    og: {
      title: 'License',
      description:
        'the website code is licensed under 0BSD. third-party assets are not covered.',
      image: LOGO
    },
    components: [
      {
        type: 9,
        components: [
          {
            type: 10,
            content: `## [License](${SITE}/license)\nthe website code is licensed under [0BSD](https://opensource.org/license/0bsd), third-party assets are not covered.`
          }
        ],
        accessory: { type: 11, media: { url: LOGO } }
      },
      { type: 14, spacing: 1 },
      {
        type: 1,
        components: [linkButton('https://github.com/huhuhuhuheh/website', 'Source on GitHub')]
      }
    ]
  }
}