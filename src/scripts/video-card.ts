// Click-to-play for YouTube cards (src/components/mdx/YouTube.astro).
// A plain click swaps the card for a youtube-nocookie player; modified or
// middle clicks fall through so the link still opens YouTube in a new tab.

document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const card = (event.target as Element | null)?.closest<HTMLAnchorElement>("a.vid[data-video-id]");
  if (!card) return;

  event.preventDefault();
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(card.dataset.videoId!)}?autoplay=1`;
  iframe.title = card.dataset.videoTitle ?? "YouTube video";
  iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  card.replaceWith(iframe);
  iframe.focus();
});
