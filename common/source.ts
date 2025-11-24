enum SourcePlatform {
  YOUTUBE = "YOUTUBE"
}

enum SourceHost {
  YOUTUBE = "YOUTUBE",
  YOUTU_BE = "YOUTU_BE"
}

const KNOWN_HOSTS = new Map<string, SourceHost>()
  .set("youtu.be", SourceHost.YOUTU_BE)
  .set("youtube.com", SourceHost.YOUTUBE)

export { KNOWN_HOSTS, SourceHost, SourcePlatform }