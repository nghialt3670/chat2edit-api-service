import { Options } from "clamscan";

export const clamOptions: Options = {
  removeInfected: false, // If true, removes infected files
  quarantineInfected: false, // False: Don't quarantine, Path: Moves files to this place.
  debugMode: false, // Whether or not to log info/debug/error msgs to the console
  scanRecursively: true, // If true, deep scan folders recursively
  clamscan: {
    path: "/usr/bin/clamscan", // Path to clamscan binary on your server
    scanArchives: true, // If true, scan archives (ex. zip, rar, tar, dmg, iso, etc...)
    active: true, // If true, this module will consider using the clamscan binary
  },
  clamdscan: {
    socket: "/var/run/clamav/clamd.ctl", // Socket file for connecting via TCP
    host: "localhost", // IP of host to connect to TCP interface
    port: 3000, // Port of host to use when connecting via TCP interface
    timeout: 60000, // Timeout for scanning files
    localFallback: true, // Use local preferred binary to scan if socket/tcp fails
    path: "/usr/bin/clamdscan", // Path to the clamdscan binary on your server
    multiscan: true, // Scan using all available cores! Yay!
    reloadDb: false, // If true, will re-load the DB on every call (slow)
    active: true, // If true, this module will consider using the clamdscan binary
    bypassTest: false, // Check to see if socket is available when applicable
  },
  preference: "clamdscan", // If clamdscan is found and active, it will be used by default
}