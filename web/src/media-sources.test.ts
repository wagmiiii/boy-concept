import { describe, expect, it } from "vitest";
import { isSelfHostedVideo, youtubeEmbedUrl } from "./media-sources";

// The ids here are fixture strings shaped like YouTube's eleven character ids. They point at
// nothing and are never rendered.
describe("which sources may start on their own", () => {
  it("names the files we serve and nothing else", () => {
    expect(isSelfHostedVideo("/media/demo-reel-1.mp4")).toBe(true);
    expect(isSelfHostedVideo("https://www.youtube.com/watch?v=FIXTUREvid1")).toBe(false);
    expect(isSelfHostedVideo("[video url]")).toBe(false);
  });
});

describe("the YouTube embed", () => {
  it("accepts every link form that carries an id and lands on the consent-free host", () => {
    for (const url of [
      "https://www.youtube.com/watch?v=FIXTUREvid1",
      "https://youtu.be/FIXTUREvid1",
      "https://www.youtube.com/embed/FIXTUREvid1",
    ]) {
      expect(youtubeEmbedUrl(url)).toBe("https://www.youtube-nocookie.com/embed/FIXTUREvid1?autoplay=1&rel=0");
    }
  });

  it("comes back undefined for anything without an id", () => {
    expect(youtubeEmbedUrl("https://example.invalid/clip.mp4")).toBeUndefined();
    expect(youtubeEmbedUrl("/media/demo-reel-1.mp4")).toBeUndefined();
    expect(youtubeEmbedUrl("")).toBeUndefined();
  });
});
