// The two shapes a video source can take, kept out of content-rules.ts because the reel's client
// script needs them and content-rules.ts imports zod. Nothing that runs in the browser should drag
// a schema library along: visitors are on phones over mobile data.
// ARCHITECTURE.md section 5, decisions D23 and D29.

/**
 * True only for a file we serve from web/public/media. A clip from YouTube needs a tap before an
 * iframe exists (rule 10), so nothing from that half is ever eligible to start on its own (D29).
 * @param url a project's video_url
 */
export function isSelfHostedVideo(url: string): boolean {
  return url.startsWith("/media/");
}

const YOUTUBE_ID = /(?:v=|youtu\.be\/|embed\/)([\w-]{11})/;

/**
 * The embed URL for a YouTube source, on the consent-free host, or undefined when the link carries
 * no video id. The reel builds the iframe inside the tap listener, so this is the only place a
 * YouTube URL becomes an embed, and the autoplay parameters live here rather than at each call site.
 * @param url a project's video_url
 */
export function youtubeEmbedUrl(url: string): string | undefined {
  const id = YOUTUBE_ID.exec(url)?.[1];
  return id === undefined ? undefined : `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
}
