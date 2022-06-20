import {execSync} from 'child_process';
import {cleanupTempFiles} from './cleanup';
import {getConvertedFilePath} from './logs';
import {enableAllExtensions} from './extensions';

export const defaultArgs = [
  '--headless',
  '--invisible',
  '--nodefault',
  '--view',
  '--nolockcheck',
  '--nologo',
  '--norestore',
  '--nofirststartwizard',
];

const LO_BINARY_PATH = 'libreoffice7.3';

type ExtensionOptions = {
  extensions: string[];
  shouldThrowOnExtensionFail?: boolean;
};

/**
 * Converts a file in /tmp to the desired file format
 * @param {String} filename Name of the file to convert located in /tmp directory
 * @param {String} format File format to convert incoming file to
 * @param {ExtensionOptions} options LibreOffice extensions to be enabled during file conversion
 * @return {Promise<String>} Absolute path to the converted file
 */
export function convertTo(filename: string, format: string, options?: ExtensionOptions): string {
  cleanupTempFiles();

  if (options?.extensions?.length) {
    enableAllExtensions(options.extensions, options.shouldThrowOnExtensionFail);
  }

  const argumentsString = defaultArgs.join(' ');
  const outputFilename = filename.split(/\\ /).join(' ');

  const cmd = `cd /tmp && ${LO_BINARY_PATH} ${argumentsString} --convert-to ${format} --outdir /tmp /tmp/${outputFilename}`;

  let logs;

  // due to an unknown issue, we need to run command twice
  try {
    logs = execSync(cmd);
  } catch (e) {
    logs = execSync(cmd);
  }

  execSync(`rm /tmp/${outputFilename}`);
  cleanupTempFiles();

  return getConvertedFilePath(logs.toString());
}
