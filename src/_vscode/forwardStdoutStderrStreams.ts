/**
 * Forward writes to process.stdout and process.stderr to console.log.
 *
 * For some reason this seems to be required for the Jest output to be streamed
 * to the Debug Console.
 */
export function forwardStdoutStderrStreams() {
  const logger = (line: string) => {
    console.info(line);
    return true;
  };

  process.stdout.write = logger;
  process.stderr.write = logger;
}
