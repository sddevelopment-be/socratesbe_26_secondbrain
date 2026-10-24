---
okf_version: "0.2"
title: Changelog
description: What changed on the SoCraTes BE 2026 second brain, newest first, written for the people who read and contribute to it.
doc_status: active
type: Operations
kind: Hub
updated: 2026-10-24T00:00:00Z
tags: [changelog]
authors:
  - human:stijn
  - agent:claude
sidebar:
  order: 0
---

# Changelog

What changed on this site, newest first. Each entry leads with what you will
notice, then says what was different before.

## Unreleased

### Added

**Find any session on your phone and start its notes in one tap.** A new
[Schedule](../sessions/schedule.md) page transcribes the marketplace board for
Friday 23 and Saturday 24 October. Phones get a list by time; wide screens get
a room grid. The page needs no JavaScript. Each session shows *Read the notes*
once a session note is published, or *Start the notes*, which opens GitHub with
a ready-made note file.

- Before: sessions were a hand-kept list on the Sessions page; you made up a
  file name, copied frontmatter from the guide and published a draft.
- After: the schedule names the file and fills in the template, the Sessions
  page lists notes by itself, and a note goes live when its pull request is
  merged. Agents read the same schedule at `api/schedule.json` and in the
  page's text views.

### Fixed

**Session notes and ideas now reach every agent surface.** They were missing
from `llms.txt`, the agent API and the sitemap, because their sections were
limited to the RSS feed.
