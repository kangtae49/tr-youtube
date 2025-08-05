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
# pre download: src-tauri/resources/
- yt-dlp.exe
- ffmpeg.exe

```sh
yt-dlp -f bestvideo+bestaudio --merge-output-format mp4 --paths "c:/sources" https://www.youtube.com/watch?v=wo96t6jDyHw
yt-dlp -x --audio-format mp3 --audio-quality 0 --postprocessor-args "ffmpeg:-af loudnorm" --paths "c:/sources" https://www.youtube.com/watch?v=wo96t6jDyHw
yt-dlp --write-sub --write-auto-sub --sub-lang ko --convert-subs srt https://www.youtube.com/watch?v=wo96t6jDyHw
yt-dlp --list-subs https://www.youtube.com/watch?v=wo96t6jDyHw
yt-dlp --dump-json https://www.youtube.com/watch?v=wo96t6jDyHw
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