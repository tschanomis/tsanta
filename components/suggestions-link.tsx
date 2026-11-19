"use client";

import Link from "next/link";

export function SuggestionsLink() {
  return (
    <Link
      href="/suggestions"
      onClick={(event) => event.currentTarget.closest<HTMLElement>("[popover]")?.hidePopover()}
      className="mt-1 block rounded-md px-3 py-2 text-sm font-normal hover:bg-emerald-950 hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-emerald-400"
    >
      Suggestions
    </Link>
  );
}
