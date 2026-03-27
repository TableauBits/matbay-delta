enum SourcePlatform {
  YOUTUBE = "YOUTUBE"
}

type SourcePlatformType = `${SourcePlatform}`;

enum SourceHost {
  YOUTUBE = "YOUTUBE",
  YOUTU_BE = "YOUTU_BE"
}

const KNOWN_HOSTS = new Map<string, SourceHost>()
  .set("youtu.be", SourceHost.YOUTU_BE)
  .set("youtube.com", SourceHost.YOUTUBE);

interface Source {
  sourceID: string;
  platform: SourcePlatformType;
}

export {
  KNOWN_HOSTS,
  type Source,
  SourceHost,
  SourcePlatform,
  type SourcePlatformType
}