function init() {
  if (!process || process.env.NODE_ENV !== 'development') return false;

  const filesInDirectory = (dir: any) =>
    new Promise((resolve) =>
      dir.createReader().readEntries((entries: any[]) =>
        Promise.all(
          entries
            .filter((e: { name: string[] }) => e.name[0] !== '.')
            .map(
              (e: {
                isDirectory: any;
                file: (arg0: (value: unknown) => void) => void;
              }) =>
                e.isDirectory
                  ? filesInDirectory(e)
                  : new Promise((resolve) => e.file(resolve))
            )
        )
          .then((files: any) => [].concat(...files))
          .then(resolve)
      )
    );

  const timestampForFilesInDirectory = (dir: any) =>
    filesInDirectory(dir).then((files: any) =>
      files
        .map(
          (f: { name: any; lastModifiedDate: any }) =>
            f.name + f.lastModifiedDate
        )
        .join()
    );

  const watchChanges = (
    dir: FileSystemDirectoryEntry,
    lastTimestamp?: undefined
  ) => {
    timestampForFilesInDirectory(dir).then((timestamp) => {
      if (!lastTimestamp || lastTimestamp === timestamp) {
        setTimeout(() => watchChanges(dir, timestamp), 1000); // retry after 1s
      } else {
        location.reload();
      }
    });
  };

  chrome.management.getSelf((self) => {
    if (self.installType === 'development') {
      chrome.runtime.getPackageDirectoryEntry((dir) => watchChanges(dir));
    }
  });
}

export default init;
