# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)


```sh
C:\sources>pnpm create tauri-app
.../1986e2f82a9-3b30                     |   +2 +
.../1986e2f82a9-3b30                     | Progress: resolved 12, reused 2, downloaded 0, added 2, done
✔ Project name · tr-youtube
✔ Identifier · com.tr-youtube.app
✔ Choose which language to use for your frontend · TypeScript / JavaScript - (pnpm, yarn, npm, deno, bun)
✔ Choose your package manager · pnpm
✔ Choose your UI template · React - (https://react.dev/)
✔ Choose your UI flavor · TypeScript

Template created! To get started run:
  cd tr-youtube
  pnpm install
  pnpm tauri android init

For Desktop development, run:
  pnpm tauri dev

For Android development, run:
  pnpm tauri android dev

```

```
cargo tauri icon .\icons\tr-youtube.svg
```

```sh
yt-dlp -x --audio-format mp3 --audio-quality 0 --postprocessor-args "-af loudnorm" --paths "c:/sources" https://www.youtube.com/watch?v=wo96t6jDyHw&list=RDwo96t6jDyHw&start_radio=1
--
yt-dlp -f bestvideo+bestaudio --merge-output-format mp4 --paths "c:/sources" https://www.youtube.com/watch?v=wo96t6jDyHw&list=RDwo96t6jDyHw&start_radio=1

yt-dlp --list-subs https://www.youtube.com/watch?v=wo96t6jDyHw

yt-dlp --dump-json  https://www.youtube.com/watch?v=wo96t6jDyHw

--convert-subs srt
--write-subs --sub-lang ko
--write-auto-subs
```

```
[youtube] Extracting URL: https://www.youtube.com/watch?v=wo96t6jDyHw
[youtube] wo96t6jDyHw: Downloading webpage
[youtube] wo96t6jDyHw: Downloading tv client config
[youtube] wo96t6jDyHw: Downloading tv player API JSON
[youtube] wo96t6jDyHw: Downloading ios player API JSON
[youtube] wo96t6jDyHw: Downloading m3u8 information
[info] Available automatic captions for wo96t6jDyHw:
Language Name                  Formats
ab       Abkhazian             vtt, srt, ttml, srv3, srv2, srv1, json3
aa       Afar                  vtt, srt, ttml, srv3, srv2, srv1, json3
af       Afrikaans             vtt, srt, ttml, srv3, srv2, srv1, json3
ak       Akan                  vtt, srt, ttml, srv3, srv2, srv1, json3
sq       Albanian              vtt, srt, ttml, srv3, srv2, srv1, json3
am       Amharic               vtt, srt, ttml, srv3, srv2, srv1, json3
ar       Arabic                vtt, srt, ttml, srv3, srv2, srv1, json3
hy       Armenian              vtt, srt, ttml, srv3, srv2, srv1, json3
as       Assamese              vtt, srt, ttml, srv3, srv2, srv1, json3
ay       Aymara                vtt, srt, ttml, srv3, srv2, srv1, json3
```

```
pnpm add "@xterm/xterm"
pnpm add "@fortawesome/free-solid-svg-icons"
pnpm add "@fortawesome/react-fontawesome"
pnpm add "@rexxars/react-split-pane"                                                                                                    
pnpm add "@types/node"
pnpm add "react-router-dom"
pnpm add "react-virtualized-auto-sizer"
pnpm add "react-window"
pnpm add "zustand"
pnpm add "@tauri-apps/plugin-opener"

```

```
//  ,
//    "core:event:default",
//    "core:event:allow-listen",
//    "dialog:default",
//    "core:webview:default",
//    "core:webview:allow-internal-toggle-devtools"

```