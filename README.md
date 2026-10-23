# Uselg / FluxPort New API Task Plugin

New API Task Plugin API v1 adapter for FluxPort video, image, and supported music models. It uses the gateway `openai_video` protocol for video task creation, polling, and content retrieval.

## Install from the New API plugin marketplace

Add this marketplace index URL in the New API task plugin marketplace settings:

`https://raw.githubusercontent.com/kgarthur0093/uselg-newapi-task-plugin/main/index.json`

Or upload [`plugin.js`](plugins/tasks/uselg-interface/1.0.0/plugin.js) from the root-only Task Plugin management page. This plugin was validated against New API `v1.0.0-rc.44` Task Plugin API v1.

## Channel setup

- Channel type: **Task Plugin**
- Plugin: **uselg-interface**
- Base URL: `https://api.ai-media.vip`
- Credential: FluxPort API key as the channel API key (Bearer)
- Models: add only models currently available to your upstream account

Clients call the gateway's `POST /v1/videos`; the plugin forwards to `POST /v1/videos`, polls `GET /v1/videos/{task_id}`, and retrieves media from `GET /v1/videos/{task_id}/content` on the upstream Base URL.

## Pricing

The plugin reports usage facts, not prices. Configure per-model New API prices using the plugin's declared profiles: `seconds` for per-second video models and `clips` for per-request video models. Confirm current account-group prices in FluxPort before setting prices. `wan3.0-video` reference video duration is included in reported seconds.

## Notes

The upstream API key is configured in the New API channel; never put it in plugin source. The checked-in Docker image is not included in this repository; the locally exported `.tar` is provided separately for manual transfer to your test server.
