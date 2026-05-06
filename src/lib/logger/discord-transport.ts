export type LogLevel = "info" | "warn" | "error" | "debug";

interface DiscordMessageParams {
  level: LogLevel;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  error?: Error;
}

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  timestamp: string;
  fields: { name: string; value: string; inline: boolean }[];
}

const COLORS = {
  info: 3447003,
  warn: 16776960,
  error: 16711680,
  debug: 9807270,
};

export const sendToDiscord = async ({
  level,
  title,
  message,
  metadata,
  error,
}: DiscordMessageParams) => {
  if (level === "debug") return;

  const webhookUrl =
    level === "info"
      ? process.env.DISCORD_WEBHOOK_URL_INFO
      : process.env.DISCORD_WEBHOOK_URL_ERRORS;

  if (!webhookUrl) return;

  const embed: DiscordEmbed = {
    title: `[${level.toUpperCase()}] ${title}`,
    description: message,
    color: COLORS[level],
    timestamp: new Date().toISOString(),
    fields: [],
  };

  if (metadata && Object.keys(metadata).length > 0) {
    embed.fields.push({
      name: "Metadata",
      value: "```json\n" + JSON.stringify(metadata, null, 2).slice(0, 1000) + "\n```",
      inline: false,
    });
  }

  if (error) {
    embed.fields.push({ name: "Error Name", value: error.name, inline: true });
    embed.fields.push({ name: "Error Message", value: error.message, inline: true });
    if (error.stack) {
      embed.fields.push({
        name: "Stack Trace",
        value: "```\n" + error.stack.substring(0, 1010) + "\n```",
        inline: false,
      });
    }
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch {
    // Silent fail — logger must never throw.
  }
};
