export type LogLevel = "info" | "warn" | "error" | "debug";

interface DiscordMessageParams {
  level: LogLevel;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  error?: Error;
}

const COLORS = {
  info: 3447003,   // Blue
  warn: 16776960,  // Yellow
  error: 16711680, // Red
  debug: 9807270,  // Grey
};

export const sendToDiscord = async ({ level, title, message, metadata, error }: DiscordMessageParams) => {
  if (level === "debug") return; // Usually we don't send debug to Discord

  const webhookUrl =
    level === "info"
      ? process.env.DISCORD_WEBHOOK_URL_INFO
      : process.env.DISCORD_WEBHOOK_URL_ERRORS;

  if (!webhookUrl) {
    console.warn(`[Discord Logger] Missing webhook URL for level: ${level}`);
    return;
  }

  // Construct standard Embed
  const embed: any = {
    title: `[${level.toUpperCase()}] ${title}`,
    description: message,
    color: COLORS[level],
    timestamp: new Date().toISOString(),
    fields: [],
  };

  if (metadata && Object.keys(metadata).length > 0) {
    let metadataString = "```json\n" + JSON.stringify(metadata, null, 2).slice(0, 1000) + "\n```";
    embed.fields.push({
      name: "Metadata",
      value: metadataString,
      inline: false,
    });
  }

  if (error) {
    embed.fields.push({
      name: "Error Name",
      value: error.name,
      inline: true,
    });
    embed.fields.push({
      name: "Error Message",
      value: error.message,
      inline: true,
    });
    if (error.stack) {
      embed.fields.push({
        name: "Stack Trace",
        value: "```\n" + error.stack.substring(0, 1010) + "\n```",
        inline: false,
      });
    }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      console.error(`[Discord Logger Failed] Status: ${response.status}`);
    }
  } catch (err) {
    console.error("[Discord Logger Failed] Network Error:", err);
  }
};
