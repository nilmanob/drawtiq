"use client";

/**
 * Netlify's edge injects a promotional HTML comment into <head> of every
 * server-rendered response ("This site is hosted on Netlify..." with utm
 * parameters). That comment is not part of the React tree, so React fails
 * to hydrate the document, the whole root falls back to a client render
 * (React error #423), and the page stays inert until that recovery render
 * finishes. On the sign-in screen this looks like a form that ignores
 * clicks for several seconds.
 *
 * `next/script strategy="beforeInteractive"` cannot fix this in the app
 * router: Next only queues those scripts via self.__next_s and runs them
 * from the framework runtime, after hydration has already started.
 *
 * This component instead removes the injected comments synchronously in a
 * client-module side effect. Client chunks are evaluated before the
 * hydration tree walk, so React never observes the comments. The deletion
 * stays surgical: only comments in <head> whose content mentions Netlify
 * are removed.
 */

declare global {
  interface Window {
    __drawtiqNetlifyCommentStripReady?: boolean;
  }
}

const NETLIFY_MARKER = "Netlify";

function stripNetlifyComments() {
  const head = document.head;
  if (!head) {
    return;
  }

  let node = head.firstChild;
  while (node) {
    const next = node.nextSibling;
    if (
      node.nodeType === 8 /* comment */ &&
      typeof node.nodeValue === "string" &&
      node.nodeValue.includes(NETLIFY_MARKER)
    ) {
      head.removeChild(node);
    }
    node = next;
  }
}

if (typeof document !== "undefined") {
  if (!window.__drawtiqNetlifyCommentStripReady) {
    window.__drawtiqNetlifyCommentStripReady = true;
    stripNetlifyComments();

    // Later responses can still receive the injected comment on reloads or
    // client navigations before React owns the head; keep it clean.
    if (typeof MutationObserver === "function") {
      new MutationObserver(stripNetlifyComments).observe(document.head, {
        childList: true,
      });
    }
  }
}

export default function NetlifyCommentStrip() {
  return null;
}
