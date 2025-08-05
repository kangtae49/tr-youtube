import {useEffect, useState} from "react";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faFolder, faDownload, faGear, faCircleStop, faCircle } from '@fortawesome/free-solid-svg-icons'
import {open} from "@tauri-apps/plugin-dialog";
import { openPath } from '@tauri-apps/plugin-opener';
import {commands} from "@/bindings.ts";
import {useTaskNotifyMapStore} from "@/stores/taskNotifyMapStore.ts";
import {useSelectedTermIdStore} from "@/stores/selectedTermIdStore.ts";
import {subLang} from "@/components/subLang.ts";


function YoutubeDownloadView() {
  const taskNotifyMap = useTaskNotifyMapStore(state => state.taskNotifyMap);
  const setSelectedTermId = useSelectedTermIdStore(state => state.setSelectedTermId);
  const selectedTermId = useSelectedTermIdStore(state => state.selectedTermId);
  const [inputUrl, setInputUrl] = useState<string>("");
  const [youtubeUrl, setYoutubeUrl] = useState<string | undefined>(undefined);
  const [saveFolder, setSaveFolder] = useState<string | undefined>(undefined);
  const [cmdVideo, setCmdVideo] = useState<string[] | undefined>(undefined);
  const [cmdAudio, setCmdAudio] = useState<string[] | undefined>(undefined);
  const [cmdSubtitle, setCmdSubtitle] = useState<string[] | undefined>(undefined);
  const [lang, setLang] = useState<string>(navigator.language.split('-')[0]);

  const onChangeInputUrl = (url: string) => {
    setInputUrl(url);
    console.log(url);
  }

  // const onClickNext = () => {
  //   if (inputUrl == "" || saveFolder == undefined) return;
  //   const url = new URL(inputUrl);
  //   console.log(url);
  //   const param = url.searchParams.get("v");
  //   if (param == null) return;
  //   const youtubeUrl = `${url.origin}${url.pathname}?v=${param}`;
  //   const cmdVideo: string[] = [
  //     "-f", "bestvideo+bestaudio",
  //     "--merge-output-format", "mp4",
  //     "--paths", saveFolder,
  //     youtubeUrl,
  //   ];
  //   const cmdAudio: string[] = [
  //     "-x",
  //     "--audio-format", "mp3",
  //     "--audio-quality", "0",
  //     "--postprocessor-args", "ffmpeg:-af loudnorm",
  //     "--paths", saveFolder,
  //     youtubeUrl,
  //   ];
  //
  //   const cmdSubtitle: string[] = [
  //     "--write-sub",
  //     "--write-auto-sub",
  //     "--sub-lang", "ko",
  //     "--convert-subs", "srt",
  //     "--paths", saveFolder,
  //     youtubeUrl,
  //   ]
  //   setYoutubeUrl(youtubeUrl);
  //   setCmdVideo(cmdVideo);
  //   setCmdAudio(cmdAudio);
  //   setCmdSubtitle(cmdSubtitle);
  // }

  const clickOpenSaveFolder = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (typeof selected === 'string') {
      console.log(selected);
      setSaveFolder(selected);
    }
  }
  const clickOpenPath = async () => {
    if (saveFolder == undefined) return;
    await openPath(saveFolder);
  }

  const downloadVideo = async () => {
    if (cmdVideo == undefined) return;
    console.log(cmdVideo);
    commands.runShell({
      task_id: crypto.randomUUID().split("-")[0],
      shell_type: "YtDlp",
      args: cmdVideo
    }).then((res) => {
      console.log(res);
    })
  }

  const downloadAudio = async () => {
    if (cmdAudio == undefined) return;
    console.log(cmdAudio);
    commands.runShell({
      task_id: crypto.randomUUID().split("-")[0],
      shell_type: "YtDlp",
      args: cmdAudio
    }).then((res) => {
      console.log(res);
    })
  }

  const downloadSubtitle = async () => {
    if (cmdSubtitle == undefined) return;
    console.log(cmdSubtitle);
    commands.runShell({
      task_id: crypto.randomUUID().split("-")[0],
      shell_type: "YtDlp",
      args: cmdSubtitle
    }).then((res) => {
      console.log(res);
    })
  }

  /*
  !!! not working - child process
  const stopTask = (taskId: string) => {
    commands.stopShell(taskId).then((res) => {
      console.log(res);
    })
  }
   */

  // useEffect(() => {
  //   if (youtubeUrl == undefined) return;
  //   commands.getMediaInfo(youtubeUrl).then((res) => {
  //     if (res.status == "ok") {
  //       const json = JSON.parse(res.data);
  //       console.log(json);
  //     }
  //   })
  //
  // }, [youtubeUrl])

  useEffect(() => {
    if (inputUrl == "") return;
    if (saveFolder == undefined) return;
    if (lang == undefined) return;

    const url = new URL(inputUrl);
    console.log(url);
    const param = url.searchParams.get("v");
    if (param == null) return;
    const youtubeUrl = `${url.origin}${url.pathname}?v=${param}`;
    const cmdVideo: string[] = [
      "-f", "bestvideo+bestaudio",
      "--merge-output-format", "mp4",
      "--paths", saveFolder,
      youtubeUrl,
    ];
    const cmdAudio: string[] = [
      "-x",
      "--audio-format", "mp3",
      "--audio-quality", "0",
      "--postprocessor-args", "ffmpeg:-af loudnorm",
      "--paths", saveFolder,
      youtubeUrl,
    ];

    const cmdSubtitle: string[] = [
      "--write-sub",
      "--write-auto-sub",
      "--sub-lang", lang,
      "--convert-subs", "srt",
      "--paths", saveFolder,
      youtubeUrl,
    ]
    setYoutubeUrl(youtubeUrl);
    setCmdVideo(cmdVideo);
    setCmdAudio(cmdAudio);
    setCmdSubtitle(cmdSubtitle);
  }, [inputUrl, saveFolder, lang]);


  useEffect(() => {
    // setInputUrl("https://www.youtube.com/watch?v=wo96t6jDyHw&list=RDwo96t6jDyHw&start_radio=1");
    commands.getHomeDir().then((res) => {
      if (res.status == 'ok') {
        const downloadDir = res.data["DownloadDir"];
        if (downloadDir != undefined) {
          setSaveFolder(downloadDir);
        }
      }
    });

  }, []);

  return (
    <div className="main-view">
      <div className="row">
        <div className="label">Save folder</div>
        <div className="icon" onClick={clickOpenSaveFolder}><Icon icon={faFolder} /></div>
        { saveFolder != undefined && <div className="save-folder" onClick={clickOpenPath}>{saveFolder}</div>}
      </div>
      <div className="row">
        <div className="label">Youtube url</div>
        <div className="icon">
          {/*<Icon icon={faGear} onClick={onClickNext} />*/}
        </div>
        <div className="input">
          <input value={inputUrl}
                 type="text"
                 placeholder="https://www.youtube.com/watch?v="
                 onChange={(event) => onChangeInputUrl(event.target.value)}
          />
        </div>
      </div>
      {youtubeUrl && (
        <>
          <div className="row">
            <div className="label">Video Download</div>
            <div className="icon"><Icon icon={faDownload}  onClick={downloadVideo}/></div>
            <div className="info">yt-dlp {cmdVideo?.join(" ")}</div>
          </div>
          <div className="row">
            <div className="label">Subtitle Download</div>
            <div className="icon"><Icon icon={faDownload}  onClick={downloadSubtitle}/></div>
            <div className="select-lang">
              <select value={lang} onChange={(event) => setLang(event.target.value)}>
                {subLang.map(([k, v]) => (
                  <option key={k} value={k}>{k} - {v}</option>
                ))}
              </select>
            </div>
            <div className="info">yt-dlp {cmdSubtitle?.join(" ")}</div>
          </div>

          <div className="row">
            <div className="label">Audio Download</div>
            <div className="icon"><Icon icon={faDownload} onClick={downloadAudio}/></div>
            <div className="info">yt-dlp {cmdAudio?.join(" ")}</div>
          </div>

          <div className="task-list">
            {Object.entries(taskNotifyMap).map( ([k, v]) => {
              const endNodify = v.find((n) => n.task_status === "End");
              const bgColor = k == selectedTermId ? "#f4a261" : "#dadaea";
              return (
                <div className="task" key={k} style={{backgroundColor: bgColor}} >
                  {endNodify == undefined && <div className="spinner"></div>}
                  {/*{endNodify == undefined && <div className="icon" onClick={()=>stopTask(k)}><Icon icon={faCircleStop}/></div>}*/}
                  {endNodify != undefined && <div className="icon"><Icon icon={faCircle}/></div>}
                  <div className="nm" onClick={()=>setSelectedTermId(k)}>{k}</div>
                </div>
              )
            })}
          </div>
        </>
      )}

    </div>
  )
}

export default YoutubeDownloadView;
